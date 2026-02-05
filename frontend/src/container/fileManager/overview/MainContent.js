import React from 'react';
import PropTypes from 'prop-types';
import FeatherIcon from 'feather-icons-react';
import { useDispatch } from 'react-redux';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { deleteAddActiveClass } from '../../../redux/fileManager/actionCreator';

function MainContent({ folder }) {
  const dispatch = useDispatch();
  const deleteFileNdFolder = (paths) => {
    return dispatch(deleteAddActiveClass(paths));
  };
  return (
    <div className="sDash-file-card">
      <Cards headless bodyStyle={{ background: '#F4F5F7', borderRadius: '10px' }}>
        <Dropdown
          className="folder-dropdown"
          content={
            <>
              <a href="#" onClick={(e) => e.preventDefault()} className="cursor-pointer d-flex align-items-center">
                <FeatherIcon icon="eye" size={14} />
                Download
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); deleteFileNdFolder(folder.path); }} className="cursor-pointer d-flex align-items-center">
                <FeatherIcon icon="link" size={14} />
                Copy
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="cursor-pointer d-flex align-items-center">
                <FeatherIcon icon="trash-2" size={14} />
                Delete
              </a>
            </>
          }
          action={['click']}
        >
          <span className="cursor-pointer d-inline-block">
            <FeatherIcon icon="more-vertical" />
          </span>
        </Dropdown>
        <div className="file-logo">
          <img src={require(`../../../static/img/files/pdf.png`)} alt="" />
        </div>
        <span className="file-name">
          {folder.name}
          {folder.type ? `.${folder.type}` : ''}
        </span>
      </Cards>
    </div>
  );
}

MainContent.propTypes = {
  folder: PropTypes.object,
};

export default MainContent;
