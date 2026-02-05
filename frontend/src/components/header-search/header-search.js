import React from 'react';
import { Input, Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { NextNavLink } from '../utilities/NextLink';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Div } from './header-search-style';
import { headerSearchAction } from '../../redux/headerSearch/actionCreator';
import { Popover } from '../popup/popup';

const HeaderSearch = ({ darkMode }) => {
  const dispatch = useDispatch();
  const searchData = useSelector(state => state.headerSearchData);
  const rtl = useSelector(state => state.ChangeLayoutMode.rtlData);

  const search = e => {
    dispatch(headerSearchAction(e.target.value));
  };

  const content = (
    <div>
      {searchData.length ? (
        searchData.map(group => {
          const { title, count, id } = group;
          return (
            <NextNavLink key={id} href="#">
              {title}
              <span className="certain-search-item-count">{count} people</span>
            </NextNavLink>
          );
        })
      ) : (
        <NextNavLink href="#">Data Not found....</NextNavLink>
      )}
    </div>
  );

  return (
    <>
      <Div className="certain-category-search-wrapper w-100" darkMode={darkMode}>
        <Row className="ant-row-middle">
          <Col md={2} xs={1} className={rtl ? 'text-left' : 'text-right'}>
            <span className="certain-category-icon">
              <FeatherIcon icon="search" size={16} />
            </span>
          </Col>
          <Col md={22} xs={23}>
            <Popover
              placement={!rtl ? 'bottomLeft' : 'bottomRight'}
              content={content}
              title="Search List"
              action="focus"
            >
              <Input placeholder="Procurar..." onInput={search} />
            </Popover>
          </Col>
        </Row>
      </Div>
    </>
  );
};

HeaderSearch.propTypes = {
  darkMode: PropTypes.bool,
};

export default HeaderSearch;
