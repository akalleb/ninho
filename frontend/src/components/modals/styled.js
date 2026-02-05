import Styled from 'styled-components';
import { Modal } from 'antd';

const ModalStyledColord = (type, theme) => `
  .ant-modal-content, .ant-modal-header {
    background-color: ${type !== 'default' && theme[`${type}-color`]} !important;
  }
  .ant-modal-title {
    color: #fff;
  }
  .ant-modal-close {
    color: #fff !important;
  }
  .ant-modal-close-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    line-height: 22px;
  }
  .ant-modal-close:hover {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  .ant-modal-close-icon {
    color: #fff !important;
    font-size: 14px;
  }
  .ant-modal-footer button {
    background: #fff;
    color: #999;
    border: 1px solid #ffff;
  }
`;

const ModalStyled = Styled(Modal)`    
  ${({ theme, type }) => type && ModalStyledColord(type, theme)}
`;

export { ModalStyled, ModalStyledColord };
