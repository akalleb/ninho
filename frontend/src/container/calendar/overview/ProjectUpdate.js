import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import UpdateEvent from './UpdateEvent';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { UpdatePopup } from '../Style';
import { Modal } from '../../../components/modals/antd-modals';
import { getImageUrl } from '../../../utility/getImageUrl';

function ProjectUpdate({ title, id, description, label, onEventDelete, time, date, type, onClose }) {
  const data = { title, id, description, label, onEventDelete, time, date, type };
  const [visible, setVisible] = useState(false);
  const onHandleVisible = () => {
    setVisible(true);
  };
  const onCancel = () => setVisible(false);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  return (
    <UpdatePopup>
      <Modal
        className="addEvent-modal"
        footer={null}
        type="primary"
        title="Update Event"
        open={visible}
        onCancel={onCancel}
      >
        <UpdateEvent onCancel={onCancel} data={data} />
      </Modal>

      <Cards headless>
        <div className={`headerUpdate ${label}`}>
          <h4>{title}</h4>
          <div className="action">
            <span 
              onClick={onHandleVisible} 
              className="cursor-pointer d-inline-flex align-items-center justify-content-center"
            >
              <FeatherIcon icon="edit-3" size={14} />
            </span>
            {/* <span className="cursor-pointer d-inline-block">
              <FeatherIcon icon="mail" size={14} />
            </span> */}
            <span 
              onClick={() => onEventDelete(id)} 
              className="cursor-pointer d-inline-flex align-items-center justify-content-center"
            >
              <FeatherIcon icon="trash-2" size={14} />
            </span>
            <span 
              onClick={handleClose}
              className="cursor-pointer d-inline-flex align-items-center justify-content-center"
            >
              <FeatherIcon icon="x" size={14} />
            </span>
          </div>
        </div>
        <div className="bodyUpdate">
          <p className="event-info">
            <FeatherIcon icon="calendar" size={16} /> <span className="label">Date:</span>{' '}
            <strong>{moment(date[0], 'MM/DD/YYYY').format('dddd, MMMM DD')}</strong>
          </p>
          <p className="event-info">
            <FeatherIcon icon="clock" size={16} /> <span className="label">Time:</span>
            <strong>{`${time[0]} - ${time[1]}`}</strong>
          </p>
          <p className="event-info">
            <img src={getImageUrl('static/img/icon/right.svg')} alt="menu" />{' '}
            <span className="desc">{description}</span>
          </p>
        </div>
      </Cards>
    </UpdatePopup>
  );
}

ProjectUpdate.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  description: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  onEventDelete: PropTypes.func,
  onClose: PropTypes.func,
  time: PropTypes.array,
  date: PropTypes.array,
};

export default ProjectUpdate;
