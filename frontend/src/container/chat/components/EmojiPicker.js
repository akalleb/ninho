import React, { useState } from 'react';
import Picker from 'emoji-picker-react';
import FeatherIcon from 'feather-icons-react';
import { BackShadowEmoji } from '../style';
import propTypes from 'prop-types';

/**
 * Emoji Picker Component
 * Provides emoji selection functionality with a toggleable picker
 */
const EmojiPicker = ({ onEmojiSelect, className = '' }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleTogglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleEmojiClick = (event, emojiObject) => {
    if (onEmojiSelect) {
      onEmojiSelect(emojiObject.emoji);
    }
    // Optionally close picker after selection
    // setShowPicker(false);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
  };

  return (
    <>
      {showPicker && <BackShadowEmoji onClick={handleClosePicker} />}
      <span className={`smile-icon ${className}`}>
        {showPicker && <Picker onEmojiClick={handleEmojiClick} />}
        <span onClick={handleTogglePicker} className="cursor-pointer">
          <FeatherIcon icon="smile" size={24} />
        </span>
      </span>
    </>
  );
};

EmojiPicker.propTypes = {
  onEmojiSelect: propTypes.func.isRequired,
  className: propTypes.string,
};

export default EmojiPicker;

