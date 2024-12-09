import { LOCAL_SERVER_LINK } from '../constants';

export const getSnapshotPages = async (links: string[]) => {
  const response = await fetch(LOCAL_SERVER_LINK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ links }),
  });
  const data = (await response.json()) as { snapshots: string[] };
  const uInt8ArrayList: Uint8Array[] = [];
  const dimensions: { width: number; height: number }[] = [];
  const snapshots = data.snapshots;
  for (const snapshot of snapshots) {
    const uInt8Array = base64ToUint8Array(snapshot);
    const dimension = await getImageDimension(uInt8Array);
    if (getPNGDimensions(uInt8Array).height > 3500) {
      const uInt8ArrayListTrim = await imageSplitterByHeight(
        uInt8Array,
        dimension.width,
        dimension.height
      );
      uInt8ArrayListTrim.forEach((uInt8ArrayTrim) => {
        uInt8ArrayList.push(uInt8ArrayTrim);
        const dimension = getPNGDimensions(uInt8ArrayTrim);
        dimensions.push(dimension);
      });
    } else {
      uInt8ArrayList.push(uInt8Array);
      const dimension = getPNGDimensions(uInt8Array);
      dimensions.push(dimension);
    }
  }
  return { imagesData: uInt8ArrayList, dimensions };
};

export const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

//shorthand way but required async
export const getImageDimension = (data: Uint8Array): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([data], { type: 'image/png' });
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      // Clean up url after use
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };
    img.onerror = () => {
      // Clean up url after use
      URL.revokeObjectURL(objectUrl);
      reject({ width: -1, height: -1 });
      throw new Error('Failed to load image.');
    };
    img.src = objectUrl;
  });
};

export const getPNGDimensions = (imageData: Uint8Array) => {
  const dataView = new DataView(imageData.buffer);

  // PNG signature check
  if (
    dataView.getUint32(0) !== 0x89504e47 || // \x89PNG
    dataView.getUint32(4) !== 0x0d0a1a0a // \r\n\x1a\n
  ) {
    throw new Error('Not a valid PNG file.');
  }

  // The IHDR chunk starts at byte 8, and width/height are at fixed positions
  const width = dataView.getUint32(16);
  const height = dataView.getUint32(20);

  return { width, height };
};

// utilised canvas to split images into 4k or less as plugins support limitation
// https://www.figma.com/plugin-docs/api/properties/figma-createimage/
export const imageSplitterByHeight = (
  data: Uint8Array,
  width: number,
  height: number,
  splitHeight = 3500
): Promise<Uint8Array[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([data], { type: 'image/png' });
    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
    const chunksCount = Math.ceil(height / splitHeight);
    const remainHeight = height % splitHeight;
    const chunks: Uint8Array[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    // Clean up url after use
    img.onload = () => {
      console.log('load image');
      for (let index = 0; index < chunksCount; index++) {
        //last chunk dynamic height
        if (chunksCount - 1 === index) canvas.height = remainHeight;
        else canvas.height = splitHeight;
        if (canvas.height > splitHeight) throw new Error('invalid canvas height');
        const offsetY = splitHeight * index;
        context?.drawImage(img, 0, offsetY, width, canvas.height, 0, 0, width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const base64String = dataUrl.split(',')[1];
        const binaryString = atob(base64String);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        chunks.push(uint8Array);
        resolve(chunks);
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject([]);
      throw new Error('Failed to load image.');
    };
  });
};

export const isValidURL = (value: string) => {
  const urlPattern =
    // eslint-disable-next-line no-useless-escape
    /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\?(.)*)?/g;
  return urlPattern.test(value);
};

export const getSitemapLinks = (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const xmlText = event.target?.result;
      if (typeof xmlText !== 'string') throw new Error('invalid xmlText');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const locElements = xmlDoc.getElementsByTagName('loc');
      const links = [];
      for (const locElement of locElements) {
        if (locElement.textContent) links.push(locElement.textContent);
      }
      resolve(links);
    };
    if (!file) throw new Error('invalid file');
    reader.readAsText(file);
  });
};
