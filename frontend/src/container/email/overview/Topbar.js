'use client';

import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Tooltip } from 'antd';
import propTypes from 'prop-types';
import { MessageAction } from './style';

function Topbar({ refreshState }) {
  return (
    <>
      <MessageAction>
        <Tooltip placement="bottom" title="Refresh">
          <span onClick={refreshState} className="cursor-pointer">
            <FeatherIcon icon="rotate-cw" size={18} />
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title="Archive">
          <span className="cursor-pointer">
            <FeatherIcon icon="archive" size={18} />
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title="Info">
          <span className="cursor-pointer">
            <FeatherIcon icon="alert-octagon" size={18} />
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title="Delete">
          <span className="cursor-pointer">
            <FeatherIcon icon="trash" size={18} />
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title="Read">
          <span className="cursor-pointer">
            <FeatherIcon icon="book-open" size={18} />
          </span>
        </Tooltip>
        <Tooltip placement="bottom" title="Folder">
          <span className="cursor-pointer">
            <FeatherIcon icon="folder" size={18} />
          </span>
        </Tooltip>
      </MessageAction>
    </>
  );
}

Topbar.propTypes = {
  refreshState: propTypes.func.isRequired,
};

export default Topbar;
