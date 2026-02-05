import React, { useEffect } from 'react';
import { Badge } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { NextNavLink } from '../../../utilities/NextLink';
import { Popover } from '../../../popup/popup';
import { readNotificationList } from '../../../../redux/notification/actionCreator';

function NotificationBox() {
  const dispatch = useDispatch();
  const notification = useSelector(state => state.notification.data);

  useEffect(() => {
    if (readNotificationList) {
      dispatch(readNotificationList());
    }
  });

  const popoverContent = (
    <div>
      {notification.map(item => {
        const { id, from } = item;
        return (
          <NextNavLink key={id} href="#">
            {from}
          </NextNavLink>
        );
      })}
      <p>
        <NextNavLink style={{ display: 'block', textAlign: 'center' }} href="#">
          Read more
        </NextNavLink>
      </p>
    </div>
  );

  return (
    <div className="notification" style={{ marginTop: 10 }}>
      <Popover placement="bottomLeft" title="Notification List" content={popoverContent} trigger="click">
        <Badge dot offset={[-8, -5]}>
          <NextNavLink href="#" className="head-example">
            <FeatherIcon icon="bell" size={20} />
          </NextNavLink>
        </Badge>
      </Popover>
    </div>
  );
}

export default NotificationBox;
