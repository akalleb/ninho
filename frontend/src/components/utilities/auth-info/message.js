import React from 'react';
import { Badge } from 'antd';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { NextLink } from '../../utilities/NextLink';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSelector, shallowEqual } from 'react-redux';
import { AtbdTopDropdwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import noPathImg from '../../../static/img/avatar/NoPath.png';

function MessageBox() {
  const { rtl } = useSelector(
    state => ({
      rtl: state.ChangeLayoutMode.rtlData,
    }),
    shallowEqual
  );

  function renderThumb({ style, ...props }) {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  }

  const renderTrackVertical = () => {
    const thumbStyle = {
      position: 'absolute',
      width: '6px',
      transition: 'opacity 200ms ease 0s',
      opacity: 0,
      [rtl ? 'left' : 'right']: '2px',
      bottom: '2px',
      top: '2px',
      borderRadius: '3px',
    };
    return <div className="hello" style={thumbStyle} />;
  };

  function renderView({ style, ...props }) {
    const customStyle = {
      marginRight: rtl && 'auto',
    };
    return <div {...props} style={{ ...style, ...customStyle }} />;
  }

  renderThumb.propTypes = {
    style: PropTypes.shape(PropTypes.object),
  };

  renderView.propTypes = {
    style: PropTypes.shape(PropTypes.object),
  };

  const content = (
    <AtbdTopDropdwon className="atbd-top-dropdwon">
      <Heading className="atbd-top-dropdwon__title" as="h5">
        <span className="title-text">Messages</span>
        <Badge className="badge-success" count={3} />
      </Heading>
      <Scrollbars
        autoHeight
        autoHide
        renderThumbVertical={renderThumb}
        renderView={renderView}
        renderTrackVertical={renderTrackVertical}
      >
        <div className="atbd-top-dropdwon-menu">
          <ul className="atbd-top-dropdwon__nav">
            <li>
              <NextLink href="#">
                <figure className="atbd-top-dropdwon__content">
                  <img src={noPathImg} alt="" />
                  <figcaption>
                    <Heading as="h5">
                      Software <span className="color-success">3 hrs ago</span>
                    </Heading>
                    <div className="atbd-top-dropdwon__content-text">
                      <span className="atbd-top-dropdwonText">Lorem ipsum dolor amet cosec...</span>
                      <span>
                        <Badge className="badge-success" count={3} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </NextLink>
            </li>
            <li>
              <NextLink href="#">
                <figure className="atbd-top-dropdwon__content">
                  <img src={noPathImg} alt="" />
                  <figcaption>
                    <Heading as="h5">
                      Software <span className="color-success">3 hrs ago</span>
                    </Heading>
                    <div className="atbd-top-dropdwon__content-text">
                      <span className="atbd-top-dropdwonText">Lorem ipsum dolor amet cosec...</span>
                      <span>
                        <Badge className="badge-success" count={3} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </NextLink>
            </li>
            <li>
              <NextLink href="#">
                <figure className="atbd-top-dropdwon__content">
                  <img src={noPathImg} alt="" />
                  <figcaption>
                    <Heading as="h5">
                      Software <span className="color-success">3 hrs ago</span>
                    </Heading>
                    <div className="atbd-top-dropdwon__content-text">
                      <span className="atbd-top-dropdwonText">Lorem ipsum dolor amet cosec...</span>
                      <span>
                        <Badge className="badge-success" count={3} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </NextLink>
            </li>
            <li>
              <NextLink href="#">
                <figure className="atbd-top-dropdwon__content">
                  <img src={noPathImg} alt="" />
                  <figcaption>
                    <Heading as="h5">
                      Software <span className="color-success">3 hrs ago</span>
                    </Heading>
                    <div className="atbd-top-dropdwon__content-text">
                      <span className="atbd-top-dropdwonText">Lorem ipsum dolor amet cosec...</span>
                      <span>
                        <Badge className="badge-success" count={3} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </NextLink>
            </li>
            <li>
              <NextLink href="#">
                <figure className="atbd-top-dropdwon__content">
                  <img src={noPathImg} alt="" />
                  <figcaption>
                    <Heading as="h5">
                      Software <span className="color-success">3 hrs ago</span>
                    </Heading>
                    <div className="atbd-top-dropdwon__content-text">
                      <span className="atbd-top-dropdwonText">Lorem ipsum dolor amet cosec...</span>
                      <span>
                        <Badge className="badge-success" count={3} />
                      </span>
                    </div>
                  </figcaption>
                </figure>
              </NextLink>
            </li>
            <ul />
          </ul>
        </div>
      </Scrollbars>
      <NextLink className="btn-seeAll" href="#">
        See all messages
      </NextLink>
    </AtbdTopDropdwon>
  );

  return (
    <div className="message">
      <Popover placement="bottomLeft" content={content} action="click">
        <Badge dot offset={[-8, -5]}>
          <span className="head-example" style={{ cursor: 'pointer', display: 'inline-block' }}>
            <FeatherIcon icon="mail" size={20} />
          </span>
        </Badge>
      </Popover>
    </div>
  );
}

MessageBox.propTypes = {
  rtl: PropTypes.bool,
};

export default MessageBox;
