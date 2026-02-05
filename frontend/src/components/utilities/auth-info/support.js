import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { NestedDropdwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';

function Support() {
  const content = (
    <NestedDropdwon>
      <div className="support-dropdwon">
        <ul>
          <Heading as="h5">Documentation</Heading>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to customize admin</span>
          </li>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to use</span>
          </li>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>The relation of vertical spacing</span>
          </li>
        </ul>
        <ul>
          <Heading as="h5">Payments</Heading>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to customize admin</span>
          </li>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to use</span>
          </li>
        </ul>
        <ul>
          <Heading as="h5">Content Planner</Heading>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to customize admin</span>
          </li>
          <li>
            <span style={{ cursor: 'pointer', display: 'block' }}>How to use</span>
          </li>
        </ul>
      </div>
    </NestedDropdwon>
  );

  return (
    <div className="support">
      <Popover placement="bottomLeft" content={content} action="click">
        <span className="head-example" style={{ cursor: 'pointer', display: 'inline-block' }}>
          <FeatherIcon icon="help-circle" size={20} />
        </span>
      </Popover>
    </div>
  );
}

export default Support;
