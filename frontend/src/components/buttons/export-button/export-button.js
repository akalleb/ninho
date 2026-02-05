import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Popover } from '../../popup/popup';
import { Button } from '../buttons';

const ExportButtonPageHeader = () => {
  const content = (
    <>
      <a href="#">
        <FeatherIcon size={16} icon="printer" />
        <span>Printer</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="book-open" />
        <span>PDF</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="file-text" />
        <span>Google Sheets</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="x" />
        <span>Excel (XLSX)</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="file" />
        <span>CSV</span>
      </a>
    </>
  );
  return (
    <Popover placement="bottomLeft" content={content} trigger="click">
      <Button size="small" type="white">
        <FeatherIcon icon="download" size={14} />
        Export
      </Button>
    </Popover>
  );
};

export { ExportButtonPageHeader };
