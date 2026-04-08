import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { SidebarNavWrap } from '../../style';

function SideNav() {
  const [open, setOpen] = useState('menu1');
  return (
    <SidebarNavWrap>
      <div className="knowledge-sidebar">
        <h4 className="knowledge-sidebar__title">Plugins</h4>
        <FeatherIcon icon="x" />
        <ul>
          <li>
            <span onClick={() => setOpen('menu1')} className={`${open === 'menu1' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />
              <span className="menu-text">Introduction to Plugin</span>
            </span>
            <ul className={open === 'menu1' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="active cursor-pointer">
                  Switch between accounts
                </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu2')} className={`${open === 'menu2' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Productivity tools for your Plugin admin & change password</span>
            </span>
            <ul className={open === 'menu2' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Understand your actions in lorem</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu3')} className={`${open === 'menu3' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Download, install, and upgrade</span>
            </span>
            <ul className={open === 'menu3' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu4')} className={`${open === 'menu4' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Explore plans & features</span>
            </span>
            <ul className={open === 'menu4' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu5')} className={`${open === 'menu5' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Explore plans & features</span>
            </span>
            <ul className={open === 'menu5' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu6')} className={`${open === 'menu6' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Profile Settings</span>
            </span>
            <ul className={open === 'menu6' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu7')} className={`${open === 'menu7' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Listings Management</span>
            </span>
            <ul className={open === 'menu7' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
          <li>
            <span onClick={() => setOpen('menu8')} className={`${open === 'menu8' ? 'active' : ''} cursor-pointer d-flex align-items-center`}>
              <FeatherIcon icon={open === 'menu1' ? 'chevron-down' : 'chevron-up'} size={14} />{' '}
              <span className="menu-text">Miscellaneous</span>
            </span>
            <ul className={open === 'menu8' ? 'submenu show' : 'submenu'}>
              <li>
                <a href="#" className="cursor-pointer">Switch between accounts</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Installing vendor marketplace lorem vendor marketplace </a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Stop getting emails from lorem</a>
              </li>
              <li>
                <a href="#" className="cursor-pointer">Threads to organize discussions</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </SidebarNavWrap>
  );
}

export default SideNav;
