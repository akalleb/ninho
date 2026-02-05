import React, { useLayoutEffect } from 'react';
import FeatherIcon from 'feather-icons-react';
import { ReactSVG } from 'react-svg';
import { TopMenuStyle } from './style';
import { getImageUrl } from '../utility/getImageUrl';
import { NextNavLink, NextLink } from '../components/utilities/NextLink';

function TopMenu() {
  // const match = useMatch('/admin/*');
  const path = '/admin';

  useLayoutEffect(() => {
    const active = document.querySelector('.strikingDash-top-menu a.active');
    const activeDefault = () => {
      const megaMenu = active.closest('.megaMenu-wrapper');
      const hasSubMenuLeft = active.closest('.has-subMenu-left');
      if (!megaMenu) {
        active.closest('ul').previousSibling.classList.add('active');
        if (hasSubMenuLeft) hasSubMenuLeft.closest('ul').previousSibling.classList.add('active');
      } else {
        active.closest('.megaMenu-wrapper').previousSibling.classList.add('active');
      }
    };
    window.addEventListener('load', active && activeDefault);
    return () => window.removeEventListener('load', activeDefault);
  }, []);

  const addParentActive = (event) => {
    if (!event || !event.currentTarget) {
      return;
    }

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.parent').forEach((element) => {
        element.classList.remove('active');
      });
    }

    const currentTarget = event.currentTarget;
    const hasSubMenuLeft = currentTarget.closest('.has-subMenu-left');
    const megaMenu = currentTarget.closest('.megaMenu-wrapper');
    
    if (!megaMenu) {
      const parentUl = currentTarget.closest('ul');
      if (parentUl && parentUl.previousSibling) {
        parentUl.previousSibling.classList.add('active');
      }
      if (hasSubMenuLeft) {
        const subMenuUl = hasSubMenuLeft.closest('ul');
        if (subMenuUl && subMenuUl.previousSibling) {
          subMenuUl.previousSibling.classList.add('active');
        }
      }
    } else {
      const megaMenuWrapper = currentTarget.closest('.megaMenu-wrapper');
      if (megaMenuWrapper && megaMenuWrapper.previousSibling) {
        megaMenuWrapper.previousSibling.classList.add('active');
      }
    }
  };
  return (
    <TopMenuStyle>
      <div className="strikingDash-top-menu">
        <ul>
          <li className="has-subMenu">
            <NextLink href="#" className="parent">
              Dashboard
            </NextLink>
            <ul className="subMenu">
              <li>
                <NextNavLink to={`${path}/social`} onClick={addParentActive}>
                  Social Media
                </NextNavLink>
              </li>
              <li>
                <NextNavLink to={`${path}/business`} onClick={addParentActive}>
                  Business
                </NextNavLink>
              </li>
              <li>
                <NextNavLink to={`${path}/performance`} onClick={addParentActive}>
                  Site Perfomence
                </NextNavLink>
              </li>
              <li>
                <NextNavLink to={`${path}/eco`} onClick={addParentActive}>
                  Ecomerce
                </NextNavLink>
              </li>
              <li>
                <NextNavLink to={`${path}/crm`} onClick={addParentActive}>
                  CRM
                </NextNavLink>
              </li>
              <li>
                <NextNavLink to={`${path}/sales`} onClick={addParentActive}>
                  Sales Performance
                </NextNavLink>
              </li>
            </ul>
          </li>

          <li className="has-subMenu">
            <NextLink href="#" className="parent">
              Apps
            </NextLink>
            <ul className="subMenu">
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="mail" />
                  Email
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/email/inbox`}>
                      Inbox
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/email/single/1585118055048`}>
                      Read Email
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/main/chat/private/rofiq@gmail.com`}>
                  <FeatherIcon icon="message-square" />
                  Chat
                </NextNavLink>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="shopping-cart" />
                  eComerce
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/products`}>
                      Products
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/productDetails/1`}>
                      Products Details
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/add-product`}>
                      Product Add
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/edit-product`}>
                      Product Edit
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/cart`}>
                      Cart
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/orders`}>
                      Orders
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/sellers`}>
                      Sellers
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/ecommerce/Invoice`}>
                      Invoices
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="aperture" />
                  Social App
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/profile/myProfile/overview`}>
                      My Profile
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/profile/myProfile/timeline`}>
                      Timeline
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/profile/myProfile/activity`}>
                      Activity
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="target" />
                  Project
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/project/view/grid`}>
                      Project Grid
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/project/view/list`}>
                      Project List
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/project/create`}>
                      Create Project
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/project/projectDetails/1`}>
                      Project Details
                    </NextNavLink>
                  </li>
                </ul>
              </li>

              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/app/calendar/month`}>
                  <FeatherIcon icon="calendar" />
                  Calendar
                </NextNavLink>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="users" />
                  Users
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/team`}>
                      Team
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/grid`}>
                      Users Grid
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/list`}>
                      Users List
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/grid-style`}>
                      Users Grid Style
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/grid-group`}>
                      Users Group
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/add-user/info`}>
                      Add User
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/users/dataTable`}>
                      User Table
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="user-plus" />
                  Contact
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/contact/addNew`}>
                      Contact Create
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/contact/grid`}>
                      Contact Grid
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/contact/list`}>
                      Contact List
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/app/note/all`}>
                  <FeatherIcon icon="file-text" />
                  Note
                </NextNavLink>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/app/to-do/`}>
                  <FeatherIcon icon="check-square" />
                  To Do
                </NextNavLink>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/app/kanban`}>
                  <ReactSVG className="sDash_menu-item-icon" src={getImageUrl('static/img/icon/columns.svg')} />
                  Kanban Board
                </NextNavLink>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/app/task/all`}>
                  <FeatherIcon icon="file" />
                  Task
                </NextNavLink>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <ReactSVG className="sDash_menu-item-icon" src={getImageUrl('static/img/icon/repeat.svg')} />
                  Import Export
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/importExport/import`}>
                      Import
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/importExport/export`}>
                      Export
                    </NextNavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <li className="mega-item has-subMenu">
            <NextLink href="#" className="parent">
              Pages
            </NextLink>
            <ul className="megaMenu-wrapper megaMenu-small">
              <li>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/settings`}>
                      Settings
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/gallery`}>
                      Gallery
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/pricing`}>
                      Pricing
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/banners`}>
                      {/* <FeatherIcon icon="cast" /> */}
                      Banners
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/testimonials`}>
                      {/* <FeatherIcon icon="book-open" /> */}
                      Testimonials
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/faq`}>
                      Faq`s
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/search`}>
                      Search Results
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/starter`}>
                      Blank Page
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/maintenance`}>
                      Maintenance
                    </NextNavLink>
                  </li>

                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/404`}>
                      404
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/comingSoon`}>
                      Coming Soon
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/support`}>
                      Support Center
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/changelog`}>
                      Changelog
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/knowledgebase/plugins`}>
                      Knowledgebase
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/all-articles`}>
                      All Article
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/knowledgeSingle/1`}>
                      Single Article
                    </NextNavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li className="mega-item has-subMenu">
            <NextLink href="#" className="parent">
              Components
            </NextLink>
            <ul className="megaMenu-wrapper megaMenu-wide">
              <li>
                <span className="mega-title">Components</span>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/alerts`}>
                      Alert
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/auto-complete`}>
                      AutoComplete
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/avatar`}>
                      Avatar
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/badge`}>
                      Badge
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/breadcrumb`}>
                      Breadcrumb
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/button`}>
                      Buttons
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/calendar`}>
                      Calendar
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/cards`}>
                      Card
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/carousel`}>
                      Carousel
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/cascader`}>
                      Cascader
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/checkbox`}>
                      Checkbox
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/collapse`}>
                      Collapse
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <span className="mega-title">Components</span>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/comments`}>
                      Comments
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/base`}>
                      Dashboard Base
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/date-picker`}>
                      DataPicker
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/drag`}>
                      Drag & Drop
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/drawer`}>
                      Drawer
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/dropdown`}>
                      Dropdown
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/empty`}>
                      Empty
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/grid`}>
                      Grid
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/input`}>
                      Input
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/list`}>
                      List
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/menu`}>
                      Menu
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <span className="mega-title">Components</span>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/message`}>
                      Message
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/modals`}>
                      Modals
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/notification`}>
                      Notifications
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/page-headers`}>
                      Page Headers
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/pagination`}>
                      Pagination
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/confirm`}>
                      PopConfirm
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/popover`}>
                      PopOver
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/progress`}>
                      Progress
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/radio`}>
                      Radio
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/rate`}>
                      Rate
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/result`}>
                      Result
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/select`}>
                      Select
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <span className="mega-title">Components</span>
                <ul>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/skeleton`}>
                      Skeleton
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/slider`}>
                      Slider
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/spiner`}>
                      Spiner
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/statistic`}>
                      Statistics
                    </NextNavLink>
                  </li>

                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/steps`}>
                      Steps
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/switch`}>
                      Switch
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/tabs`}>
                      Tabs
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/tags`}>
                      Tags
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/timeline`}>
                      Timeline
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/timepicker`}>
                      TimePicker
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/tree-select`}>
                      Tree Select
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/components/upload`}>
                      Upload
                    </NextNavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li className="has-subMenu">
            <NextLink href="#" className="parent">
              Features
            </NextLink>
            <ul className="subMenu">
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="bar-chart-2" />
                  Charts
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/charts/chartjs`}>
                      Chart Js
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/charts/google-chart`}>Google Chart</NextNavLink>
                  </li>
                  <li className="has-subMenu-left">
                    <NextLink href="#" className="parent">Rechart</NextLink>
                    <ul className="subMenu">
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/bar`}>
                          Bar Chart
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/area`}>
                          Area Charts
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/composed`}>
                          Composed Charts
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/line`}>
                          Line Charts
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/pie`}>
                          Pie Charts
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/radar`}>
                          Radar Charts
                        </NextNavLink>
                      </li>
                      <li>
                        <NextNavLink onClick={addParentActive} to={`${path}/charts/recharts/radial`}>
                          Radial Charts
                        </NextNavLink>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/charts/peity`}>
                      Peity Chart
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="disc" />
                  Form
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/form-layout`}>
                      Form Layouts
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/form-elements`}>
                      Form Elements
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/form-components`}>
                      Form Components
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/form-validation`}>
                      Form Validation
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="cpu" />
                  Tables
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/tables/basic`}>
                      Basic Table
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/tables/dataTable`}>
                      Data Table
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="server" />
                  Widgets
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/widgets/chart`}>
                      Chart
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/widgets/card`}>
                      Card
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/widgets/mixed`}>
                      Mixed
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/wizards`}>
                  <FeatherIcon icon="square" />
                  Wizards
                </NextNavLink>
              </li>
              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="grid" />
                  Icons
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/icons/feathers`}>
                      Feather Icons(svg)
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/icons/font-awesome`}>
                      Font Awesome
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/icons/antd`}>
                      Ant Design Icons
                    </NextNavLink>
                  </li>
                </ul>
              </li>
              <li>
                <NextNavLink onClick={addParentActive} to={`${path}/editor`}>
                  <FeatherIcon icon="edit" />
                  Editor
                </NextNavLink>
              </li>

              <li className="has-subMenu-left">
                <NextLink href="#" className="parent">
                  <FeatherIcon icon="map" />
                  Maps
                </NextLink>
                <ul className="subMenu">
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/maps/google`}>
                      Google Maps
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/maps/leaflet`}>
                      Leaflet Maps
                    </NextNavLink>
                  </li>
                  <li>
                    <NextNavLink onClick={addParentActive} to={`${path}/maps/Vector`}>
                      Vector Maps
                    </NextNavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </TopMenuStyle>
  );
}

export default TopMenu;
