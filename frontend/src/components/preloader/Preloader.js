'use client';

import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Styled from 'styled-components';
import config from '../../config/config';

const { theme } = config;

const PreloaderWrapper = Styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ darkMode }) => 
    darkMode ? '#1a1d29' : '#ffffff'};
  margin: 0;
  padding: 0;
  z-index: 99999;
  overflow: hidden;
  box-sizing: border-box;
  /* Suppress Next.js scroll behavior warnings for fixed position */
  scroll-behavior: auto;
  
  .preloader-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin: 0;
    padding: 0;
    
    .preloader-logo {
      font-size: 32px;
      font-weight: 700;
      color: ${theme['primary-color'] || '#5F63F2'};
      margin: 0;
      padding: 0;
      letter-spacing: 1px;
      animation: fadeIn 0.5s ease-in;
      line-height: 1.2;
      text-align: center;
      display: block;
    }
    
    .preloader-spinner {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .ant-spin-dot-item {
        background-color: ${theme['primary-color'] || '#5F63F2'};
      }
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

const Preloader = ({ darkMode = false }) => {
  const primaryColor = theme['primary-color'] || '#5F63F2';
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color: primaryColor }} spin />;

  return (
    <PreloaderWrapper darkMode={darkMode}>
      <div className="preloader-content">
        {/* <div className="preloader-logo">StriKingDash</div> */}
        <Spin className="preloader-spinner" size="large" indicator={antIcon} />
      </div>
    </PreloaderWrapper>
  );
};

export default Preloader;

