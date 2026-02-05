import React from 'react';
import { Upload, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';
import { getImageUrl } from '../../../utility/getImageUrl';

function CoverSection() {
  const { message } = App.useApp();

  return (
    <div className="cover-image">
      <img
        src={getImageUrl('static/img/profile/cover-img.png')}
        alt="Capa do perfil"
      />
      <Upload
        showUploadList={false}
        beforeUpload={() => {
          message.info('Alterar capa ainda não está disponível.');
          return false;
        }}
      >
        <a href="#" className="cursor-pointer">
          <FeatherIcon icon="camera" size={16} /> Alterar capa
        </a>
      </Upload>
    </div>
  );
}

CoverSection.propTypes = {
  match: propTypes.object,
};

export default CoverSection;
