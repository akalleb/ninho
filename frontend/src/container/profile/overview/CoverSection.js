import React from 'react';
import propTypes from 'prop-types';
import { getImageUrl } from '../../../utility/getImageUrl';
import { useSelector } from 'react-redux';

function CoverSection() {
  const { cover_url } = useSelector(state => state.auth.login || {});
  
  const cover = cover_url ? getImageUrl(cover_url) : getImageUrl('static/img/profile/cover-img.png');

  return (
    <div className="cover-image">
      <img
        src={cover}
        alt="Capa do perfil"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
            e.target.onerror = null;
            e.target.src = getImageUrl('static/img/profile/cover-img.png');
        }}
      />
    </div>
  );
}

CoverSection.propTypes = {
  match: propTypes.object,
};

export default CoverSection;
