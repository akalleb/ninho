import React from 'react';
import PropTypes from 'prop-types';
import { GalleryCard } from '../style';
import Heading from '../../../components/heading/heading';
import { getImageUrl } from '../../../utility/getImageUrl';

function GalleryCards({ item }) {
  const { name, img, category } = item;
  return (
    <GalleryCard className="mb-25">
      <figure>
        <img className="w-100" src={getImageUrl(img)} alt="" />
        <figcaption>
          <div className="gallery-single-content">
            <Heading className="gallery-single-title" as="h4">
              {name}
            </Heading>
            <p>{category}</p>
          </div>
        </figcaption>
      </figure>
    </GalleryCard>
  );
}

GalleryCards.propTypes = {
  item: PropTypes.object,
};

export default GalleryCards;
