'use client';

/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams } from 'next/navigation';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import Picker from 'emoji-picker-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Scrollbars } from 'react-custom-scrollbars';
import { SmileOutlined, MoreOutlined } from '@ant-design/icons';
import { SingleChatWrapper, MessageList, Footer, BackShadowEmoji } from '../style';
import Heading from '../../../components/heading/heading';
import { Button } from '../../../components/buttons/buttons';
import { updateGroupChat } from '../../../redux/chat/actionCreator';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import chatAuthImg from '../../../static/img/avatar/chat-auth.png';

function SingleGroupChat() {
  const params = useParams();
  const dispatch = useDispatch();
  const { rtl, chat } = useSelector(state => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
      chat: state.chatSingle.data,
    };
  }, shallowEqual);
  const left = !rtl ? 'left' : 'right';

  const [state, setState] = useState({
    chatData: chat || [],
    me: 'woadud@gmail.com',
    singleContent: chat && chat.length > 0 ? chat[0].content : [],
    name: chat && chat.length > 0 ? chat[0].groupName : '',
    inputValue: '',
    fileList: [],
    fileList2: [],
  });
  const [pickerShow, setPickerShow] = useState(false);
  const { singleContent, name, me, inputValue } = state;

  useEffect(() => {
    let unmounted = false;
    if (!unmounted && chat && chat.length > 0) {
      setState(prevState => ({
        ...prevState,
        chatData: chat,
        singleContent: chat[0].content,
        name: chat[0].groupName,
        inputValue: prevState.inputValue,
        me: 'woadud@gmail.com',
        fileList: [],
        fileList2: [],
      }));
    }
    return () => {
      unmounted = true;
    };
  }, [params, chat]);

  const handleChange = e => {
    setState({
      ...state,
      inputValue: e.target.value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();

    const pushcontent = {
      content: inputValue,
      time: new Date().getTime(),
      seen: false,
      reaction: false,
      email: me,
      userName: 'Woadud Akand',
    };
    dispatch(updateGroupChat(parseInt(params.id, 10), pushcontent));
    setState({
      ...state,
      singleContent: [...singleContent, pushcontent],
      inputValue: '',
    });
  };

  const onEmojiClick = (event, emojiObject) => {
    setState({ ...state, inputValue: inputValue + emojiObject.emoji });
  };

  const onPickerShow = () => {
    setPickerShow(!pickerShow);
  };


  const attachment = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList);
        setState({
          ...state,
          fileList2: info.fileList,
        });
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
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

  return (
    <SingleChatWrapper className="group-chat">
      {pickerShow && <BackShadowEmoji onClick={() => setPickerShow(false)} />}
      <Cards
        title={
          <div className="group-chat-header d-flex">
            <Heading as="h5">{name}</Heading>
            <div className="members">
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="cursor-pointer">
                <img src={chatAuthImg} alt="" />
              </span>
              <span className="show-more cursor-pointer">
                <span>20+</span>
              </span>
              <span className="add-more cursor-pointer">
                <span className="add-icon">
                  <FeatherIcon icon="plus" size={14} />
                </span>
              </span>
            </div>
          </div>
        }
        more={content}
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
                  <li className="atbd-chatbox__single" key={id} style={{ overflow: 'hidden' }}>
                    <div className={mes.email !== me ? 'left' : 'right'}>
                      {mes.email !== me ? (
                        <img src={chatAuthImg} alt="" />
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
                                          <FeatherIcon icon="more-horizontal" size={16} />
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
                                        <span className="cursor-pointer">Edit</span>
                                      </li>
                                      <li>
                                        <span className="cursor-pointer">Copy</span>
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
                                        <span className="cursor-pointer">Edit</span>
                                      </li>
                                      <li>
                                        <span className="cursor-pointer">Copy</span>
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
                        {singleContent.length === index + 1 ? (
                          <div className="group-seen">
                            <img src={chatAuthImg} alt="" />
                            <img src={chatAuthImg} alt="" />
                            <img src={chatAuthImg} alt="" />
                            <img src={chatAuthImg} alt="" />
                            <img src={chatAuthImg} alt="" />
                            <img src={chatAuthImg} alt="" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
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
              className={`chatbox-reply-form d-flex ${state.fileList.length && 'hasImage'} ${state.fileList2.length &&
                'hasFile'}`}
            >
              <span className="smile-icon">
                {pickerShow && <Picker onEmojiClick={onEmojiClick} />}
                <span onClick={onPickerShow} className="cursor-pointer">
                  <FeatherIcon icon="smile" size={24} />
                </span>
              </span>
              <div className="chatbox-reply-input">
                <input
                  onChange={handleChange}
                  placeholder="Type your message..."
                  name="chat"
                  id="chat"
                  style={{ width: '100%' }}
                  value={inputValue}
                />
              </div>
              <div className="chatbox-reply-action d-flex">
                <Upload {...attachment}>
                  <span className="cursor-pointer">
                    <FeatherIcon icon="camera" size={18} />
                  </span>
                </Upload>
                <Upload {...attachment}>
                  <span className="cursor-pointer">
                    <FeatherIcon icon="paperclip" size={18} />
                  </span>
                </Upload>
                <Button onClick={handleSubmit} type="primary">
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

export default SingleGroupChat;
