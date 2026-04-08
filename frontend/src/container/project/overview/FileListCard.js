import React from 'react';
import { NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';

function FileListCard() {
  return (
    <Cards title="Arquivos">
      <div className="file-list">
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single__content">
              <span className="file-name">Nenhum arquivo disponível</span>
            </div>
          </div>
        </div>
      </div>
    </Cards>
  );
}

export default FileListCard;
