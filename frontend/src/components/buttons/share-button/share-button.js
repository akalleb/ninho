import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Popover } from '../../popup/popup';
import { Button } from '../buttons';

const ShareButtonPageHeader = () => {
  const content = (
    <>
      <a href="#">
        <FeatherIcon size={16} icon="facebook" />
        <span>Facebook</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="twitter" />
        <span>Twitter</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="rss" />
        <span>Feed</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="linkedin" />
        <span>Linkedin</span>
      </a>
      <a href="#">
        <FeatherIcon size={16} icon="instagram" />
        <span>Instagram</span>
      </a>
    </>
  );
  return (
    <Popover placement="bottomLeft" content={content} trigger="click">
      <Button size="small" type="white" key="3">
        <FeatherIcon icon="share-2" size={14} />
        Share
      </Button>
    </Popover>
  );
};

export { ShareButtonPageHeader };
