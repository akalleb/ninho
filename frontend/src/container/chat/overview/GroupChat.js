'use client';

import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { NextNavLink } from '../../../components/utilities/NextLink';
import moment from 'moment';
import FeatherIcon from 'feather-icons-react';
import { Badge } from 'antd';
import { BlockSpan, ChatWrapper } from '../style';
import { textRefactor } from '../../../components/utilities/utilities';
import { filterSinglepageGroup } from '../../../redux/chat/actionCreator';
import { Button } from '../../../components/buttons/buttons';
import { getImageUrl } from '../../../utility/getImageUrl';

function GroupChat() {
  const chatData = useSelector(state => state.groupChat.data, shallowEqual);
  const dispatch = useDispatch();

  const dataFiltering = id => {
    dispatch(filterSinglepageGroup(id));
  };

  return (
    <ChatWrapper>
      <div className="create-action">
        <Button className="btn-add" size="default" type="default" shape="round" block>
          <FeatherIcon icon="edit" size={14} />
          Create New Group
        </Button>
      </div>

      <ul>
        {chatData &&
          chatData
            .sort((a, b) => {
              return b.time - a.time;
            })
            .map((user, key) => {
              const { groupName, content, id, img } = user;
              const { time } = content[content.length - 1];
              const same = moment(time).format('MM-DD-YYYY') === moment().format('MM-DD-YYYY');
              return (
                <li key={id} className="chat-link-signle">
                  <NextNavLink onClick={() => dataFiltering(id)} to={`/admin/main/chat/group/${id}`}>
                    <div className="author-figure">
                      <img src={getImageUrl(`static/img/chat-author/${img}`)} alt="" />
                    </div>

                    <div className="author-info">
                      <BlockSpan className="author-name">{groupName}</BlockSpan>
                      <BlockSpan className="author-chatText">
                        {textRefactor(content[content.length - 1].content, 5)}
                      </BlockSpan>
                    </div>
                    <div className="author-chatMeta">
                      <BlockSpan>{same ? moment(time).format('hh:mm A') : moment(time).format('dddd')}</BlockSpan>
                      {key <= 1 && <Badge className="badge-success" count={3} />}
                    </div>
                  </NextNavLink>
                </li>
              );
            })}
      </ul>
    </ChatWrapper>
  );
}
export default GroupChat;
