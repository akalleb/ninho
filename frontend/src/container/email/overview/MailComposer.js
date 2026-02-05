/* eslint-disable no-unused-expressions */
'use client';

import React, { useState, useEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import RichTextEditor from 'react-rte';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import propTypes from 'prop-types';
import { Upload, message } from 'antd';
import { MailBox } from './style';
import { Button } from '../../../components/buttons/buttons';

function MailComposer({ onChange, onSend, defaultTag, replay, text }) {
  const [state, setState] = useState({
    value: null,
    tags: defaultTag ? [defaultTag] : [],
  });

  useEffect(() => {
    // Initialize RichTextEditor only on client side
    if (typeof window !== 'undefined') {
      setState(prev => ({
        ...prev,
        value: RichTextEditor.createEmptyValue(),
      }));
    }
  }, []);

  const onChanges = value => {
    setState({ ...state, value });
    if (onChange) {
      onChange(value.toString('html'));
    }
  };

  const handleChange = tags => {
    setState({ ...state, tags });
  };

  const onSubmit = () => {
    if (state.value) {
      onSend && onSend(state.value.toString('html'));
    }
  };

  const props = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <MailBox>
      <div className="body">
        {!text && (
          <div className="group d-flex justify-content-between align-items-center">
            <div className="reply-inner d-flex align-items-center">
              {!replay ? null : <span className="reply-title">Replay To</span>}
              <TagsInput
                inputProps={{
                  placeholder: replay ? null : 'To',
                }}
                value={state.tags}
                onChange={handleChange}
              />
            </div>
            <span className="mail-cc">Cc</span>
          </div>
        )}
        <div className="group">
          {state.value && <RichTextEditor placeholder="Type your message..." value={state.value} onChange={onChanges} />}
        </div>
      </div>
      {!text && (
        <div className="footer">
          <div className="left d-flex align-items-center">
            <Button size="default" type="primary" onClick={onSubmit} raised>
              Send
            </Button>
            <span className="cursor-pointer">
              <Upload {...props}>
                <FeatherIcon icon="paperclip" size={16} />
              </Upload>
            </span>
            <span className="cursor-pointer">
              <FeatherIcon icon="alert-circle" size={16} />
            </span>
          </div>
          <div className="right">
            <span className="cursor-pointer">
              <FeatherIcon icon="trash-2" size={16} />
            </span>
          </div>
        </div>
      )}
    </MailBox>
  );
}

MailComposer.propTypes = {
  onChange: propTypes.func,
  onSend: propTypes.func,
  defaultTag: propTypes.string,
  replay: propTypes.bool,
  text: propTypes.bool,
};

export default MailComposer;
