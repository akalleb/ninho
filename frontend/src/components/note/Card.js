/* eslint-disable react/prop-types */
import React from 'react';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from './style';
import { Cards } from '../cards/frame/cards-frame';
import { Dropdown } from '../dropdown/dropdown';
import { Bullet } from '../../container/note/style';
import { noteDeleteData, onStarUpdate, onLabelUpdate } from '../../redux/note/actionCreator';

const NoteCard = ({ data, Dragger }) => {
  const dispatch = useDispatch();
  const { noteData } = useSelector(state => {
    return {
      noteData: state.Note.data,
    };
  });
  const { title, key, description, stared, label } = data;
  const onLabelChange = labels => {
    dispatch(onLabelUpdate(noteData, key, labels));
  };
  const content = (
    <>
      <div className="nav-labels">
        <ul>
          <li>
            <span onClick={() => onLabelChange('personal')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bullet className="personal" /> Personal
            </span>
          </li>
          <li>
            <span onClick={() => onLabelChange('work')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bullet className="work" /> Work
            </span>
          </li>
          <li>
            <span onClick={() => onLabelChange('social')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bullet className="social" /> Social
            </span>
          </li>
          <li>
            <span onClick={() => onLabelChange('important')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bullet className="important" /> Important
            </span>
          </li>
        </ul>
      </div>
    </>
  );
  const onHandleDelete = () => {
    const value = noteData.filter(item => item.key !== key);
    dispatch(noteDeleteData(value));
  };
  return (
    <Card className={label}>
      <Cards headless>
        <h4>
          <span>
            {title}
            <span className={`status-bullet ${label}`} />
          </span>
          <Dragger />
        </h4>
        <p>{description}</p>
        <div className="actions">
          <span>
            <span
              className={stared ? 'star active' : 'star'}
              onClick={() => dispatch(onStarUpdate(noteData, key))}
              style={{ cursor: 'pointer', display: 'inline-block' }}
            >
              <FeatherIcon icon="star" size={16} />
            </span>
            <span onClick={() => onHandleDelete()} style={{ cursor: 'pointer', display: 'inline-block', marginLeft: '8px' }}>
              <FeatherIcon icon="trash-2" size={16} />
            </span>
          </span>
          <Dropdown content={content}>
            <span style={{ cursor: 'pointer', display: 'inline-block' }}>
              <FeatherIcon icon="more-vertical" size={20} />
            </span>
          </Dropdown>
        </div>
      </Cards>
    </Card>
  );
};

NoteCard.propTypes = {
  data: PropTypes.object,
};
export default NoteCard;
