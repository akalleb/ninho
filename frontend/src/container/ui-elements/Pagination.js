import React, { useState } from 'react';
import { Row, Col, Pagination } from 'antd';
import FeatherIcon from 'feather-icons-react';
import Styled from 'styled-components';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';

const PaginationWrapper = Styled.div`
  .ant-pagination {
    .ant-pagination-item {
      height: 36px;
      min-width: 36px;
      line-height: 34px;
      border-radius: 6px;
      margin-right: 8px;
      border: 1px solid ${({ theme }) => theme['border-color-normal']};
      
      a {
        color: ${({ theme }) => theme['gray-color']};
      }
      
      &.ant-pagination-item-active {
        background-color: ${({ theme }) => theme['primary-color']};
        border-color: ${({ theme }) => theme['primary-color']};
        
        a {
          color: #fff;
        }
      }
      
      &:hover {
        border-color: ${({ theme }) => theme['primary-color']};
        
        a {
          color: ${({ theme }) => theme['primary-color']};
        }
      }
    }
    
    .ant-pagination-prev,
    .ant-pagination-next {
      height: 36px;
      min-width: 36px;
      line-height: 34px;
      border-radius: 6px;
      margin-right: 8px;
      
      button {
        height: 100%;
        border-radius: 6px;
        color: ${({ theme }) => theme['gray-color']};
        
        &:hover {
          color: ${({ theme }) => theme['primary-color']};
          border-color: ${({ theme }) => theme['primary-color']};
        }
      }
      
      &.ant-pagination-disabled button {
        color: ${({ theme }) => theme['extra-light-color']};
        border-color: ${({ theme }) => theme['border-color-normal']};
      }
    }
    
    .ant-pagination-options {
      .ant-pagination-options-size-changer {
        height: 36px;
        
        .ant-select-selector {
          height: 36px;
          border-radius: 6px;
          padding: 0 11px;
          
          .ant-select-selection-item {
            line-height: 34px;
          }
        }
      }
    }
    
    .ant-pagination-jump-prev,
    .ant-pagination-jump-next {
      height: 36px;
      min-width: 36px;
      line-height: 34px;
      margin-right: 8px;
    }
  }
`;

function Paginations() {
  const [state, setstate] = useState({
    current: 0,
    pageSize: 0,
    page: 0,
  });
  const onShowSizeChange = (current, pageSize) => {
    setstate({ ...state, current, pageSize });
  };

  const onChange = (pageNumber) => {
    setstate({ ...state, pageNumber });
  };

  return (
    <>
      <PageHeader
        ghost
        title="Paginations"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col md={12} sm={24} xs={24}>
            <Cards title="Basic" caption="The simplest use of Pagination">
              <PaginationWrapper>
                <Pagination defaultCurrent={1} total={50} />
              </PaginationWrapper>
            </Cards>
          </Col>
          <Col md={12} sm={24} xs={24}>
            <Cards title="More Pages" caption="The simplest use of Pagination">
              <PaginationWrapper>
                <Pagination defaultCurrent={1} total={500} />
              </PaginationWrapper>
            </Cards>
          </Col>
          <Col md={12} sm={24} xs={24}>
            <Cards title="Page size" caption="The simplest use of Pagination">
              <PaginationWrapper>
                <Pagination showSizeChanger onShowSizeChange={onShowSizeChange} defaultCurrent={3} total={500} />
              </PaginationWrapper>
            </Cards>
          </Col>
          <Col md={12} sm={24} xs={24}>
            <Cards title="Quick Jumper" caption="The simplest use of Pagination">
              <PaginationWrapper>
                <Pagination showQuickJumper defaultCurrent={2} total={500} onChange={onChange} />
              </PaginationWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Paginations;
