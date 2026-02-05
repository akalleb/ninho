import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * Custom hook for managing file uploads
 * Handles file list state and upload configuration
 */
export const useFileUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [fileList2, setFileList2] = useState([]);

  /**
   * Handle file upload change
   */
  const handleFileChange = useCallback((info, targetList = 'fileList2') => {
    if (info.file.status !== 'uploading') {
      if (targetList === 'fileList2') {
        setFileList2(info.fileList);
      } else {
        setFileList(info.fileList);
      }
    }

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }, []);

  /**
   * Get upload configuration object for Ant Design Upload component
   */
  const getUploadProps = useCallback(
    (targetList = 'fileList2', actionUrl = 'https://www.mocky.io/v2/5cc8019d300000980a055e76') => ({
      name: 'file',
      action: actionUrl,
      headers: {
        authorization: 'authorization-text',
      },
      onChange: (info) => handleFileChange(info, targetList),
    }),
    [handleFileChange]
  );

  /**
   * Clear file list
   */
  const clearFileList = useCallback((targetList = 'fileList2') => {
    if (targetList === 'fileList2') {
      setFileList2([]);
    } else {
      setFileList([]);
    }
  }, []);

  return {
    fileList,
    fileList2,
    handleFileChange,
    getUploadProps,
    clearFileList,
  };
};

