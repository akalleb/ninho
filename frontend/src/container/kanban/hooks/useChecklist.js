import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing checklist operations
 * Handles adding checklists, checklist tasks, and updating checkbox states
 */
export const useChecklist = (boards, addChecklistToTask, updateChecklistTaskCheckbox) => {
  /**
   * Add a new checklist to a task
   */
  const addChecklist = useCallback(
    (taskId, checklistTitle) => {
      const checkListId = uuidv4();
      const newChecklist = {
        id: `cl-${checkListId}`,
        label: checklistTitle,
        checkListTask: [],
      };

      const currentTask = boards.tasks[taskId];
      if (currentTask) {
        const currentChecklist = currentTask.checklist || [];
        addChecklistToTask(taskId, newChecklist);
        return [...currentChecklist, newChecklist];
      }
      return [];
    },
    [boards.tasks, addChecklistToTask]
  );

  /**
   * Add a new task to a checklist
   */
  const addChecklistTask = useCallback(
    (taskId, selectedCheckList, taskTitle) => {
      const checkListTaskId = uuidv4();
      const newChecklistTask = {
        id: `${checkListTaskId}`,
        label: taskTitle,
        checked: false,
      };

      const currentTask = boards.tasks[taskId];
      if (currentTask && currentTask.checklist) {
        const updatedChecklist = currentTask.checklist.map((checklistItem) => {
          if (checklistItem.id === selectedCheckList.id) {
            return {
              ...checklistItem,
              checkListTask: [...checklistItem.checkListTask, newChecklistTask],
            };
          }
          return checklistItem;
        });
        
        // Update the task checklist directly via boards state
        // This will be handled by the parent component through updateChecklistTaskCheckbox
        // For now, we need to update it here
        return updatedChecklist;
      }
      return [];
    },
    [boards.tasks]
  );

  /**
   * Toggle checklist task checkbox
   */
  const toggleChecklistTaskCheckbox = useCallback(
    (taskId, checkListId, checkListTaskId, checked) => {
      updateChecklistTaskCheckbox(taskId, checkListId, checkListTaskId, checked);
    },
    [updateChecklistTaskCheckbox]
  );

  /**
   * Get checklist data for a task
   */
  const getChecklistData = useCallback(
    (taskId) => {
      const task = boards.tasks[taskId];
      return task?.checklist || [];
    },
    [boards.tasks]
  );

  return {
    addChecklist,
    addChecklistTask,
    toggleChecklistTaskCheckbox,
    getChecklistData,
  };
};

