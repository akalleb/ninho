'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { useParams, usePathname } from 'next/navigation';
import { useNextNavigate } from '../../../hooks/useNextRouter';
import { NextNavLink } from '../../../components/utilities/NextLink';
import { Tooltip, Row, Col, Spin } from 'antd';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';
import { MailDetailsWrapper, MessageAction, MessageDetails, ReplyList, MessageReply, MailRightAction } from './style';
import { Dropdown } from '../../../components/dropdown/dropdown';
import Heading from '../../../components/heading/heading';
import { filterSinglePage, onStarUpdate } from '../../../redux/email/actionCreator';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { getImageUrl } from '../../../utility/getImageUrl';

// Direct import - no lazy loading needed
import MailComposer from './MailComposer';

function Single() {
  const params = useParams();
  const pathname = usePathname();
  const navigate = useNextNavigate();
  const email = useSelector(state => state.emailSingle?.data?.[0]);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    replyMessage: 0,
  });

  // Get email ID from params - can be in params.id or params.slug[1]
  const slug = params?.slug || [];
  const emailId = params?.id || (Array.isArray(slug) && slug.length > 1 ? slug[1] : slug[0]) || null;

  useEffect(() => {
    if (filterSinglePage && emailId) {
      const id = parseInt(emailId, 10);
      if (!isNaN(id)) {
        dispatch(filterSinglePage(id));
      }
    }
  }, [emailId, dispatch]);

  const replyMail = async replyMessage => {
    // hit replyMail api
    setState({ ...state, replyMessage });
  };

  const onStaredChange = id => {
    dispatch(onStarUpdate(id));
  };

  // Show loading state if email data is not available yet
  if (!email) {
    return (
      <MailDetailsWrapper>
        <Cards headless>
          <div className="text-center p-50">
            <Spin />
          </div>
        </Cards>
      </MailDetailsWrapper>
    );
  }

  return (
    <MailDetailsWrapper>
      <Cards
        title={
          <>
            <MessageAction>
              <span onClick={() => navigate(-1)} className="cursor-pointer">
                <FeatherIcon icon="arrow-left" size={14} />
              </span>
              <Tooltip placement="bottom" title="Refresh">
                <span className="cursor-pointer">
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
        }
        isbutton={
          <MailRightAction>
            <span>1 - 50 of 235</span>
          </MailRightAction>
        }
      >
        <Row gutter={15}>
          <Col>
            <MessageDetails>
              <div className="d-flex justify-content-between align-items-center">
                <div className="message-subject">
                  <Heading as="h2">
                    {email.subject}
                    <span className="mail-badge primary">{email.type}</span>
                  </Heading>
                </div>

                <div className="message-action">
                  <span className="ex-coll cursor-pointer">
                    <FeatherIcon icon="chevron-up" size={16} />
                    <FeatherIcon icon="chevron-down" size={16} />
                  </span>

                  <span className="cursor-pointer">
                    <FeatherIcon icon="printer" size={16} />
                  </span>
                </div>
              </div>

              <div className="message-box d-flex justify-content-between align-items-center">
                <div className="message-author">
                  <img className="w-60px border-radius-circle" src={getImageUrl(email.img)} alt="" />
                  <div>
                    <Heading as="h4">{email.userName}</Heading>
                    <Dropdown
                      placement="bottom"
                      content={
                        <ul className="mail-props">
                          <li>
                            <span>From:</span> <span>{email.from}</span>{' '}
                          </li>
                          <li>
                            <span>To:</span> <span>{email.to}</span>{' '}
                          </li>
                          <li>
                            <span>CC:</span> <span>example@gamil.com</span>{' '}
                          </li>
                          <li>
                            <span>Date:</span> <span>{moment(email.id).format('LLL')}</span>
                          </li>
                        </ul>
                      }
                    >
                      <span className="cursor-pointer">
                        To {email.to}
                        <FeatherIcon icon="chevron-down" size={14} />
                      </span>
                    </Dropdown>
                  </div>
                </div>

                <div className="message-excerpt">
                  <span>
                    <FeatherIcon icon="paperclip" />
                  </span>
                  <span> {moment(email.id).format('LLL')} </span>
                  <span
                    className={email.stared ? 'starActive' : 'starDeactivate'}
                    onClick={() => onStaredChange(email.id)}
                    className="cursor-pointer"
                  >
                    <FontAwesome name="star-o" />
                  </span>
                  <span className="cursor-pointer">
                    <FeatherIcon icon="corner-up-left" />
                  </span>
                  <span className="cursor-pointer">
                    <FeatherIcon icon="more-vertical" />
                  </span>
                </div>
              </div>

              <div className="message-body">
                <span className="welcome-text">Hello Adam,</span>
                <p>{email.body}</p>

                <Heading as="h6">
                  Best Regards <br /> {email.userName}
                </Heading>
              </div>

              <div className="message-attachments">
                <figure>
                  <div className="attachment-image">
                    <img src={getImageUrl('static/img/email/2.png')} alt="" />
                  </div>
                  <div className="attachment-hover">
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="download" />
                    </span>
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="share-2" />
                    </span>
                  </div>
                  <figcaption>
                    <Heading as="h4">Attached.jpg</Heading>
                    <p>256.5 KB</p>
                  </figcaption>
                </figure>

                <figure>
                  <div className="attachment-image">
                    <img src={getImageUrl('static/img/email/1.png')} alt="" />
                  </div>
                  <div className="attachment-hover">
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="download" />
                    </span>
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="share-2" />
                    </span>
                  </div>
                  <figcaption>
                    <Heading as="h4">Attached.jpg</Heading>
                    <p>256.5 KB</p>
                  </figcaption>
                </figure>
                <figure>
                  <div className="attachment-image">
                    <img src={getImageUrl('static/img/email/3.png')} alt="" />
                  </div>
                  <div className="attachment-hover">
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="download" />
                    </span>
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="share-2" />
                    </span>
                  </div>
                  <figcaption>
                    <Heading as="h4">Attached.zip</Heading>
                    <p>256.5 KB</p>
                  </figcaption>
                </figure>
                <figure>
                  <div className="attachment-image">
                    <img src={getImageUrl('static/img/email/4.png')} alt="" />
                  </div>
                  <div className="attachment-hover">
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="download" />
                    </span>
                    <span className="btn-link cursor-pointer">
                      <FeatherIcon icon="share-2" />
                    </span>
                  </div>
                  <figcaption>
                    <Heading as="h4">Attached.pdf</Heading>
                    <p>256.5 KB</p>
                  </figcaption>
                </figure>
              </div>
              <hr />
            </MessageDetails>
          </Col>
        </Row>

        <Row gutter={15}>
          <Col xs={24}>
            <ReplyList>
              <div className="reply-view__single">
                <figure className="reply-view__content d-flex">
                  <img className="w-50px h-50px" src={getImageUrl('static/img/email/2.png')} alt="" />
                  <figcaption>
                    <Heading as="h6">Reynante Labares</Heading>
                    <p>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
                      inviduntLorem ipsum dolor...
                    </p>
                  </figcaption>
                </figure>
                <div className="reply-view__meta">
                  <span className="meta-list">
                    <span className="date-meta">Jan 2, 2020, 5:22 PM</span>
                    <span
                      className={`${email.stared ? 'starActive' : 'starDeactivate'} cursor-pointer`}
                      onClick={() => onStaredChange(email.id)}
                    >
                      <FontAwesome name="star-o" />
                    </span>
                    <span className="cursor-pointer">
                      <FeatherIcon icon="more-vertical" />
                    </span>
                    <span className="cursor-pointer">
                      <FeatherIcon icon="corner-up-left" />
                    </span>
                  </span>
                </div>
              </div>
            </ReplyList>
            <MessageReply>
                  <nav>
                    <ul>
                      <li>
                        <NextNavLink to={`/admin/email/single/${emailId}/replay`}>
                          <FeatherIcon icon="corner-up-left" size={14} /> Reply
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink to={`/admin/email/single/${emailId}/forward`}>
                          <FeatherIcon icon="corner-up-right" size={14} /> Forward
                        </NextNavLink>
                      </li>
                    </ul>
                  </nav>
              <div className="reply-form d-flex">
                {(pathname?.includes('replay') || state.replyMessage === 1) && (
                  <div className="w-100 reply-box">
                    <img
                      style={{ width: 50, height: 50 }}
                      src={getImageUrl('static/img/email/2.png')}
                      alt=""
                    />
                    <MailComposer replay defaultTag="Alice Freeman" onSend={replyMail} />
                  </div>
                )}
              </div>
            </MessageReply>
          </Col>
        </Row>
      </Cards>
    </MailDetailsWrapper>
  );
}

export default Single;
