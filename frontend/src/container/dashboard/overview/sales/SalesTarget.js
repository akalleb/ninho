import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { SalesTargetWrap } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import HalfProgressBar from '../../../../components/utilities/progressBar';

const moreContent = (
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

function SalesTarget() {
  return (
    <SalesTargetWrap>
      <Cards more={moreContent} title="Monthly Sales Target">
        <div className="target-progressbar-wrap">
          <HalfProgressBar percent={80} />
        </div>
        <div className="s-target-list d-flex justify-content-between">
          <div className="s-target-list__item target-revinue">
            <h2>$5,870</h2>
            <p>Revenue</p>
          </div>
          <div className="s-target-list__item">
            <h2>$7,870</h2>
            <p>Target</p>
          </div>
        </div>
      </Cards>
    </SalesTargetWrap>
  );
}

export default SalesTarget;
