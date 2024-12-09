figma.showUI(__html__, { width: 300, height: 300 });
figma.ui.onmessage = async (msg: {
  type: string;
  value: {
    imagesData: Uint8Array[];
    dimensions: {
      width: number;
      height: number;
    }[];
  };
}) => {
  if (msg.type === 'images') {
    const width = 300;
    const gap = 10;
    const uint8ArrayList = msg.value.imagesData;
    const dimensions = msg.value.dimensions;
    const nodes: SceneNode[] = [];
    for (let index = 0; index < uint8ArrayList.length; index++) {
      const { height } = dimensions[index];
      const image = figma.createImage(uint8ArrayList[index]);
      const node: RectangleNode = figma.createRectangle();
      node.x = index * (width + gap);
      node.resize(width, height);
      node.fills = [
        {
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL',
        },
      ];
      nodes.push(node);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
};

figma.on('close', () => {
  console.log('figma closed');
});
