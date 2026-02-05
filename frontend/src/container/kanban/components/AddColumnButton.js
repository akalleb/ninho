import React from 'react';
import FeatherIcon from 'feather-icons-react';
import propTypes from 'prop-types';

/**
 * Button component for triggering column addition
 */
const AddColumnButton = ({ onClick }) => {
  return (
    <div className="btn-addColumn">
      <div className="btn-addColumn-inner">
        <span className="btn-add cursor-pointer" onClick={onClick}>
          <FeatherIcon icon="plus" size={12} />
          <span>Create Board</span>
        </span>
      </div>
    </div>
  );
};

AddColumnButton.propTypes = {
  onClick: propTypes.func.isRequired,
};

export default AddColumnButton;

