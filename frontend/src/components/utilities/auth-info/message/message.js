import React, { useEffect } from 'react';
import { Badge } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { NextNavLink } from '../../../utilities/NextLink';
import { Popover } from '../../../popup/popup';
import { readMessageList } from '../../../../redux/message/actionCreator';

function MessageBox() {
  const dispatch = useDispatch();
  const message = useSelector(state => state.message.data);

  useEffect(() => {
    if (readMessageList) {
      dispatch(readMessageList());
    }
  });

  const popoverContent = (
    <div>
      {message.map(item => {
        const { id, from } = item;
        return (
          <NextNavLink key={id} href="#">
            {from}
          </NextNavLink>
        );
      })}
      <p>
        <NextNavLink style={{ display: 'block' }} href="#">
          Read more
        </NextNavLink>
      </p>
    </div>
  );

  return (
    <div className="message" style={{ marginTop: 10 }}>
      <Popover placement="bottomLeft" title="Message List" content={popoverContent} trigger="click">
        <Badge dot offset={[-8, -5]}>
          <NextNavLink href="#" className="head-example">
            <FeatherIcon icon="mail" size={20} />
          </NextNavLink>
        </Badge>
      </Popover>
    </div>
  );
}

export default MessageBox;
