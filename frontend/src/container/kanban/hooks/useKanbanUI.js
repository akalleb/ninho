import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Kanban UI state
 * Handles modal visibility, shadows, editing states, and checklist popups
 */
export const useKanbanUI = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [backShadow, setBackShadow] = useState(false);
  const [editableTaskId, setEditableTaskId] = useState('');
  const [checkListPopup, setCheckListPopup] = useState('');
  const [editable, setEditable] = useState(false);
  const [checklistData, setChecklistData] = useState({
    id: 1,
    boardId: 1,
    checklist: [],
  });

  /**
   * Show/hide the task modal
   */
  const toggleModal = useCallback((data = null) => {
    setModalVisible((prev) => !prev);
    if (data) {
      setChecklistData(data);
    }
  }, []);

  /**
   * Close the modal
   */
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  /**
   * Show back shadow and set active task ID
   */
  const showBackShadow = useCallback((taskId) => {
    setBackShadow(true);
    setEditableTaskId(taskId);
  }, []);

  /**
   * Hide back shadow and clear task ID
   */
  const hideBackShadow = useCallback(() => {
    setBackShadow(false);
    setEditableTaskId('');
  }, []);

  /**
   * Show checklist add popup
   */
  const showChecklistPopup = useCallback((id) => {
    setCheckListPopup(id);
  }, []);

  /**
   * Hide checklist add popup
   */
  const hideChecklistPopup = useCallback(() => {
    setCheckListPopup('');
  }, []);

  /**
   * Toggle task edit mode
   */
  const toggleTaskEdit = useCallback(() => {
    setEditable((prev) => !prev);
  }, []);

  /**
   * Cancel task edit mode
   */
  const cancelTaskEdit = useCallback(() => {
    setEditable(false);
  }, []);

  /**
   * Update checklist data
   */
  const updateChecklistData = useCallback((data) => {
    setChecklistData(data);
  }, []);

  /**
   * Reset all UI state
   */
  const resetUIState = useCallback(() => {
    setBackShadow(false);
    setEditableTaskId('');
    setEditable(false);
  }, []);

  return {
    // State
    modalVisible,
    backShadow,
    editableTaskId,
    checkListPopup,
    editable,
    checklistData,

    // Actions
    toggleModal,
    closeModal,
    showBackShadow,
    hideBackShadow,
    showChecklistPopup,
    hideChecklistPopup,
    toggleTaskEdit,
    cancelTaskEdit,
    updateChecklistData,
    resetUIState,
  };
};

