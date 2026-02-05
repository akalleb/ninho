import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing chat state
 * Handles chat data, messages, input value, and user info
 */
export const useChatState = (initialChat, chatId) => {
  const [chatState, setChatState] = useState({
    chatData: initialChat || [],
    me: 'woadud@gmail.com',
    singleContent: (initialChat && initialChat.length > 0 && initialChat[0]?.content) || [],
    name: (initialChat && initialChat.length > 0 && initialChat[0]?.userName) || '',
    inputValue: '',
  });

  // Update chat state when chat data changes
  useEffect(() => {
    if (initialChat && initialChat.length > 0 && initialChat[0]) {
      setChatState((prevState) => ({
        ...prevState,
        chatData: initialChat,
        singleContent: initialChat[0].content || [],
        name: initialChat[0].userName || '',
        me: 'woadud@gmail.com',
      }));
    }
  }, [chatId, initialChat]);

  /**
   * Update input value
   */
  const updateInputValue = useCallback((value) => {
    setChatState((prevState) => ({
      ...prevState,
      inputValue: value,
    }));
  }, []);

  /**
   * Add message to chat content
   */
  const addMessage = useCallback((message) => {
    setChatState((prevState) => ({
      ...prevState,
      singleContent: [...prevState.singleContent, message],
      inputValue: '',
    }));
  }, []);

  /**
   * Append text to input (e.g., emoji)
   */
  const appendToInput = useCallback((text) => {
    setChatState((prevState) => ({
      ...prevState,
      inputValue: prevState.inputValue + text,
    }));
  }, []);

  /**
   * Clear input value
   */
  const clearInput = useCallback(() => {
    setChatState((prevState) => ({
      ...prevState,
      inputValue: '',
    }));
  }, []);

  return {
    chatState,
    singleContent: chatState.singleContent,
    name: chatState.name,
    me: chatState.me,
    inputValue: chatState.inputValue,
    updateInputValue,
    addMessage,
    appendToInput,
    clearInput,
  };
};

