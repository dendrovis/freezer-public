import Classes from './App.module.scss';
import React, { ChangeEventHandler, ComponentProps, useRef } from 'react';
import { ConfirmButton, DragDropBox, Input } from './components';
import { getSitemapLinks, getSnapshotPages, isValidURL } from './utils';

type ValueTypes = { linksValue: string[] };

const App = () => {
  const initialValues = { linksValue: [] };
  // these persistence value do not required re-render
  const valueRef = useRef<ValueTypes>(initialValues);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    valueRef.current.linksValue = [];
    valueRef.current.linksValue[0] = event.target.value;
  };
  const onDropItem: ComponentProps<typeof DragDropBox>['onDrop'] = (item) => {
    valueRef.current.linksValue = [];
    if (!item) throw new Error('invalid file');
    const file = item.getAsFile();
    if (!file) throw new Error('invalid file');
    getSitemapLinks(file).then((links) => {
      valueRef.current.linksValue = links;
    });
  };
  const onClick = () => {
    const links = valueRef.current.linksValue;
    links.forEach((link) => {
      if (!isValidURL(link)) throw new Error('invalid url, please try again');
    });
    getSnapshotPages(links).then(
      (data: {
        imagesData: Uint8Array[];
        dimensions: {
          width: number;
          height: number;
        }[];
      }) => {
        parent.postMessage({ pluginMessage: { type: 'images', value: data } }, '*');
      }
    );
  };

  return (
    <main className={Classes.container}>
      <DragDropBox onDrop={onDropItem} />
      <Input onChange={onInputChange} />
      <ConfirmButton onClick={onClick} />
    </main>
  );
};

export default App;
