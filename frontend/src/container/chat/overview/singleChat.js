'use client';

/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Fragment } from 'react';
import { Upload } from 'antd';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams } from 'next/navigation';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import { SmileOutlined, MoreOutlined } from '@ant-design/icons';
import { Scrollbars } from 'react-custom-scrollbars';
import { SingleChatWrapper, MessageList, Footer } from '../style';
import Heading from '../../../components/heading/heading';
import { Button } from '../../../components/buttons/buttons';
import { updatePrivetChat } from '../../../redux/chat/actionCreator';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';
import { useChatState } from '../hooks/useChatState';
import { useFileUpload } from '../hooks/useFileUpload';
import EmojiPicker from '../components/EmojiPicker';

function SingleChat() {
  const params = useParams();
  const dispatch = useDispatch();

  const { rtl, chat } = useSelector(state => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
      chat: state.chatSingle.data || [],
    };
  }, shallowEqual);
  const left = !rtl ? 'left' : 'right';

  // Custom hooks for separated concerns
  const {
    singleContent,
    name,
    me,
    inputValue,
    updateInputValue,
    addMessage,
    appendToInput,
  } = useChatState(chat, params?.id);

  const { fileList, fileList2, getUploadProps } = useFileUpload();

  const attachment = getUploadProps('fileList2');

  const handleChange = e => {
    updateInputValue(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    const pushcontent = {
      content: inputValue,
      time: new Date().getTime(),
      seen: false,
      reaction: false,
      email: me,
    };
    if (params?.id) {
      dispatch(updatePrivetChat(params.id, pushcontent));
    }
    addMessage(pushcontent);
  };

  const handleEmojiSelect = (emoji) => {
    appendToInput(emoji);
  };

  const renderView = ({ style, ...reset }) => {
    const customStyle = {
      marginRight: 'auto',
      [rtl ? 'left' : 'right']: '2px',
      [rtl ? 'marginLeft' : 'marginRight']: '-19px',
    };
    return <div {...reset} style={{ ...style, ...customStyle }} />;
  };

  const renderThumbVertical = ({ style, ...reset }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
      [left]: '2px',
    };
    return <div style={{ ...style, ...thumbStyle }} {...reset} />;
  };

  const renderTrackVertical = () => {
    const thumbStyle = {
      position: 'absolute',
      width: '6px',
      transition: 'opacity 200ms ease 0s',
      opacity: 0,
      [rtl ? 'left' : 'right']: '6px',
      bottom: '2px',
      top: '2px',
      borderRadius: '3px',
    };
    return <div style={thumbStyle} />;
  };

  const renderThumbHorizontal = ({ style, ...reset }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
    };
    return <div style={{ ...style, ...thumbStyle }} {...reset} />;
  };

  const content = (
    <>
      <span className="cursor-pointer">
        <FeatherIcon icon="users" size={14} />
        <span>Create new group</span>
      </span>
      <span className="cursor-pointer">
        <FeatherIcon icon="trash-2" size={14} />
        <span>Delete conversation</span>
      </span>
      <span className="cursor-pointer">
        <FeatherIcon icon="slash" size={14} />
        <span>Block & Report</span>
      </span>
    </>
  );

  // Show loading state if chat data is not available
  if (!chat || chat.length === 0 || !chat[0] || !name) {
    return (
      <SingleChatWrapper>
        <Cards headless>
          <div className="text-center p-50">
            <p>Loading chat...</p>
          </div>
        </Cards>
      </SingleChatWrapper>
    );
  }

  return (
    <SingleChatWrapper>
      <Cards
        title={
          <>
            <Heading as="h5">{name || 'Chat'}</Heading>
            <p>Active Now</p>
          </>
        }
        isbutton={[
          <Dropdown content={content} key="1">
            <span className="cursor-pointer">
              <FeatherIcon icon="more-vertical" />
            </span>
          </Dropdown>,
        ]}
      >
        <ul className="atbd-chatbox">
          <Scrollbars
            className="custom-scrollbar"
            autoHide
            autoHideTimeout={500}
            autoHideDuration={200}
            renderThumbHorizontal={renderThumbHorizontal}
            renderThumbVertical={renderThumbVertical}
            renderView={renderView}
            renderTrackVertical={renderTrackVertical}
          >
            {singleContent.length ? (
              singleContent.map((mes, index) => {
                const id = mes.time;

                const same = moment(id).format('MM-DD-YYYY') === moment().format('MM-DD-YYYY');

                return (
                  <Fragment key={id}>
                    {index === 1 && (
                      <p className="time-connector text-center text-capitalize">
                        <span>today</span>
                      </p>
                    )}
                    <li className="atbd-chatbox__single overflow-hidden" key={id}>
                      <div className={mes.email !== me ? 'left' : 'right'}>
                        {mes.email !== me ? (
                          <img src={getImageUrl(`static/img/chat-author/${mes.img}`)} alt="" />
                        ) : null}

                        <div className="atbd-chatbox__content">
                          <Heading as="h5" className="atbd-chatbox__name">
                            {mes.email !== me && name}
                            <span>{same ? moment(id).format('hh:mm A') : moment(id).format('LL')}</span>
                          </Heading>

                          {mes.email !== me ? (
                            <div className="atbd-chatbox__contentInner d-flex">
                              <div className="atbd-chatbox__message">
                                <MessageList className="message-box">{mes.content}</MessageList>
                              </div>

                              <div className="atbd-chatbox__actions">
                                <Dropdown
                                  action={['hover']}
                                  content={
                                    <div className="atbd-chatbox__emoji">
                                      <ul>
                                        <li>
                                          <span className="cursor-pointer">
                                            <span role="img">&#127773;</span>
                                          </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <span role="img">&#128116;</span>
                                          </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <span role="img">&#128127;</span>
                                          </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <span role="img">&#128151;</span>
                                          </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <span role="img">&#128400;</span>
                                          </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <MoreOutlined />
                                          </span>
                                        </li>
                                      </ul>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cursor-pointer">
                                    <SmileOutlined />
                                  </span>
                                </Dropdown>

                                <Dropdown
                                  action={['hover']}
                                  content={
                                    <div className="atbd-chatbox__messageControl">
                                      <ul>
                                        <li>
                                          <span className="cursor-pointer">Copy</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Edit</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Quote</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Forward</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Remove</span>
                                        </li>
                                      </ul>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cursor-pointer">
                                    <FeatherIcon icon="more-horizontal" size={16} />
                                  </span>
                                </Dropdown>
                              </div>
                            </div>
                          ) : (
                            <div className="atbd-chatbox__contentInner d-flex">
                              <div className="atbd-chatbox__actions">
                                <Dropdown
                                  action={['hover']}
                                  content={
                                    <div className="atbd-chatbox__messageControl">
                                      <ul>
                                        <li>
                                          <span className="cursor-pointer">Edit </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Copy </span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Quote</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Forward</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">Remove</span>
                                        </li>
                                      </ul>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cursor-pointer">
                                    <FeatherIcon icon="more-horizontal" size={16} />
                                  </span>
                                </Dropdown>
                                <Dropdown
                                  action={['hover']}
                                  content={
                                    <div className="atbd-chatbox__emoji">
                                      <ul>
                                        <li>
                                          <span className="cursor-pointer">&#127773;</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">&#128116;</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">&#128127;</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">&#128151;</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">&#128400;</span>
                                        </li>
                                        <li>
                                          <span className="cursor-pointer">
                                            <MoreOutlined />
                                          </span>
                                        </li>
                                      </ul>
                                    </div>
                                  }
                                  placement="bottom"
                                >
                                  <span className="cursor-pointer">
                                    <SmileOutlined />
                                  </span>
                                </Dropdown>
                              </div>
                              <div className="atbd-chatbox__message">
                                <MessageList className="message-box">{mes.content}</MessageList>
                              </div>
                            </div>
                          )}
                          {mes.email === me && singleContent.length === index + 1 ? (
                            <div className="message-seen text-right">
                              <span className="message-seen__time">Seen 9:20 PM </span>
                              <img src={getImageUrl(`static/img/chat-author/${mes.img}`)} alt="" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  </Fragment>
                );
              })
            ) : (
              <p>No data found</p>
            )}
          </Scrollbars>
        </ul>

        <Footer>
          <form onSubmit={handleSubmit}>
            <div
              className={`chatbox-reply-form d-flex ${fileList.length && 'hasImage'} ${fileList2.length &&
                'hasFile'}`}
            >
              <div className="chatbox-reply-input">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <input
                  onChange={handleChange}
                  placeholder="Type your message..."
                  name="chat"
                  id="chat"
                  className="w-100"
                  value={inputValue}
                />
              </div>
              <div className="chatbox-reply-action d-flex">
                <span className="cursor-pointer">
                  <Upload {...attachment}>
                    <FeatherIcon icon="camera" size={18} />
                  </Upload>
                </span>
                <span className="cursor-pointer">
                  <Upload {...attachment}>
                    <FeatherIcon icon="paperclip" size={18} />
                  </Upload>
                </span>
                <Button onClick={handleSubmit} type="primary" className="btn-send">
                  <FeatherIcon icon="send" size={18} />
                </Button>
              </div>
            </div>
          </form>
        </Footer>
      </Cards>
    </SingleChatWrapper>
  );
}

export default SingleChat;
