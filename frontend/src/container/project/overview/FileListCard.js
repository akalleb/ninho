import React from 'react';
import { NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { getImageUrl } from '../../../utility/getImageUrl';

function FileListCard() {
  return (
    <Cards title="Files">
      <div className="file-list">
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single-logo">
              <img src={getImageUrl('static/img/files/zip.png')} alt="File Logo" />
            </div>
            <div className="file-single__content">
              <span className="file-name">Main-admin-design.zip</span>
              <span className="file-size">7.05 MB</span>
              <span className="file-content-action">
                <NextLink to="/">Download</NextLink>
              </span>
            </div>
          </div>
          <div className="file-single-action">
            <Dropdown
              className="wide-dropdwon"
              content={
                <>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="eye" size={14} />
                    View
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="edit" size={14} />
                    Edit
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="trash-2" size={14} />
                    Delete
                  </a>
                </>
              }
            >
              <span className="cursor-pointer d-inline-block">
                <FeatherIcon icon="more-horizontal" size={16} />
              </span>
            </Dropdown>
          </div>
        </div>
        {/* End of .file-list__single */}
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single-logo">
              <img src={getImageUrl('static/img/files/pdf.png')} alt="File Logo" />
            </div>
            <div className="file-single__content">
              <span className="file-name">Product-guidelines.pdf</span>
              <span className="file-size">522 KB</span>
              <span className="file-content-action">
                <span className="cursor-pointer">View</span>
                <span className="cursor-pointer">Download</span>
              </span>
            </div>
          </div>
          <div className="file-single-action">
            <Dropdown
              className="wide-dropdwon"
              content={
                <>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="eye" size={14} />
                    View
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="edit" size={14} />
                    Edit
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="trash-2" size={14} />
                    Delete
                  </a>
                </>
              }
            >
              <span className="cursor-pointer d-inline-block">
                <FeatherIcon icon="more-horizontal" size={16} />
              </span>
            </Dropdown>
          </div>
        </div>
        {/* End of .file-list__single */}
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single-logo">
              <img src={getImageUrl('static/img/files/psd.png')} alt="File Logo" />
            </div>
            <div className="file-single__content">
              <span className="file-name">admin-wireframe.psd</span>
              <span className="file-size">2.05 MB</span>
              <span className="file-content-action">
                <span className="cursor-pointer">Download</span>
              </span>
            </div>
          </div>
          <div className="file-single-action">
            <Dropdown
              className="wide-dropdwon"
              content={
                <>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="eye" size={14} />
                    View
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="edit" size={14} />
                    Edit
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="trash-2" size={14} />
                    Delete
                  </a>
                </>
              }
            >
              <span className="cursor-pointer d-inline-block">
                <FeatherIcon icon="more-horizontal" size={16} />
              </span>
            </Dropdown>
          </div>
        </div>
        {/* End of .file-list__single */}
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single-logo">
              <img src={getImageUrl('static/img/files/jpg.png')} alt="File Logo" />
            </div>
            <div className="file-single__content">
              <span className="file-name">Wirefram-escreenshots.jpg</span>
              <span className="file-size">522 KB</span>
              <span className="file-content-action">
                <span className="cursor-pointer">View</span>
                <span className="cursor-pointer">Download</span>
              </span>
            </div>
          </div>
          <div className="file-single-action">
            <Dropdown
              className="wide-dropdwon"
              content={
                <>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="eye" size={14} />
                    View
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="edit" size={14} />
                    Edit
                  </a>
                  <a href="#" className="cursor-pointer d-flex align-items-center">
                    <FeatherIcon icon="trash-2" size={14} />
                    Delete
                  </a>
                </>
              }
            >
              <span className="cursor-pointer d-inline-block">
                <FeatherIcon icon="more-horizontal" size={16} />
              </span>
            </Dropdown>
          </div>
        </div>
        {/* End of .file-list__single */}
        <div className="file-list__single d-flex">
          <div className="file-single-info d-flex">
            <div className="file-single-logo">
              <img src={getImageUrl('static/img/files/png.png')} alt="File Logo" />
            </div>
            <div className="file-single__content">
              <span className="file-name">Logo.png</span>
              <span className="file-size">522 KB</span>
              <span className="file-content-action">
                <span className="cursor-pointer">View</span>
                <span className="cursor-pointer">Download</span>
              </span>
            </div>
          </div>
          <div className="file-single-action">
            <Dropdown
              className="wide-dropdwon"
              content={
                <div className="dropdown-more">
                  <>
                    <span className="cursor-pointer d-flex align-items-center">
                      <FeatherIcon icon="eye" size={14} />
                      Viewt
                    </span>
                    <span className="cursor-pointer d-flex align-items-center">
                      <FeatherIcon icon="edit" size={14} />
                      Edit
                    </span>
                    <span className="cursor-pointer d-flex align-items-center">
                      <FeatherIcon icon="trash-2" size={14} />
                      Delete
                    </span>
                  </>
                </div>
              }
            >
              <span className="cursor-pointer d-inline-block">
                <FeatherIcon icon="more-horizontal" size={16} />
              </span>
            </Dropdown>
          </div>
        </div>
        {/* End of .file-list__single */}
      </div>
    </Cards>
  );
}

export default FileListCard;
