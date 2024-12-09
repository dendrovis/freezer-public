import React, { DragEventHandler, useState } from 'react';
import Classes from './DragDropBox.module.scss';
import classNames from 'classnames';

type DragDropBoxProps = { onDrop?: (item: DataTransferItem | null) => void };

const DragDropBox = ({ onDrop }: DragDropBoxProps) => {
  const [isDragOver, setDragOver] = useState(false);
  const dragdropboxClasses = classNames(Classes.dropzone, { [Classes.isdragover]: isDragOver });
  const [isWrongDrop, setWrongDrop] = useState(false);

  const onDragEnter = () => {
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDragOver: DragEventHandler = (event) => {
    // prevent default behavior which is prevent file from being opened
    event.preventDefault();
  };

  const onDropHandler: DragEventHandler = (event) => {
    // prevent default behavior which is prevent file from being opened
    event.preventDefault();
    const isSingleItem = event.dataTransfer.items.length === 1;
    const isXMLFile = event.dataTransfer.items[0].type === 'text/xml';
    setDragOver(false);
    if (isSingleItem && isXMLFile) {
      setWrongDrop(false);
      if (onDrop) onDrop(event.dataTransfer.items[0]);
    } else {
      setWrongDrop(true);
      if (onDrop) onDrop(null);
    }
  };

  return (
    <div className={Classes.container}>
      <div
        className={dragdropboxClasses}
        onDrop={onDropHandler}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      />
      <div className={Classes.dropzonemessage}>
        <p>Drag and Drop your sitemap file</p>
        <p>in .xml format here</p>
        {isWrongDrop && <p className={Classes.errormessage}>(incorrect file. please try again)</p>}
      </div>
    </div>
  );
};

export default DragDropBox;
