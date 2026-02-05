import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing Kanban board data
 * Handles all board, column, and task operations
 */
export const useKanbanBoard = (initialData) => {
  const [boards, setBoards] = useState(initialData);

  /**
   * Create a new task (card) in a specific column
   */
  const createTask = useCallback((name, card, columnId) => {
    setBoards((prevBoards) => {
      const newBoards = { ...prevBoards };
      newBoards.tasks[name] = card;
      if (newBoards.boardData[columnId]) {
        newBoards.boardData[columnId].taskIds.push(name);
      }
      return newBoards;
    });
  }, []);

  /**
   * Remove a task from a column
   */
  const removeTask = useCallback((card, columnId) => {
    setBoards((prevBoards) => {
      const newBoards = { ...prevBoards };
      const { id } = card;
      if (newBoards.boardData[columnId]) {
        newBoards.boardData[columnId].taskIds = newBoards.boardData[columnId].taskIds.filter(
          (cardId) => id !== cardId
        );
      }
      return newBoards;
    });
  }, []);

  /**
   * Delete an entire column
   */
  const deleteColumn = useCallback((columnId) => {
    setBoards((prevBoards) => {
      const newBoardOrder = prevBoards.boardOrder.filter((boardId) => boardId !== columnId);
      return {
        ...prevBoards,
        boardOrder: newBoardOrder,
      };
    });
  }, []);

  /**
   * Add a new column
   */
  const addColumn = useCallback((columnTitle) => {
    const columnId = uuidv4();
    const newColumn = {
      id: `board${columnId}`,
      title: columnTitle,
      taskIds: [],
    };

    setBoards((prevBoards) => ({
      ...prevBoards,
      boardData: {
        ...prevBoards.boardData,
        [newColumn.id]: newColumn,
      },
      boardOrder: [...prevBoards.boardOrder, newColumn.id],
    }));

    return newColumn.id;
  }, []);

  /**
   * Update column title
   */
  const updateColumnTitle = useCallback((column) => {
    setBoards((prevBoards) => ({
      ...prevBoards,
      boardData: {
        ...prevBoards.boardData,
        [column.id]: column,
      },
    }));
  }, []);

  /**
   * Update task title
   */
  const updateTaskTitle = useCallback((taskId, newTitle) => {
    setBoards((prevBoards) => ({
      ...prevBoards,
      tasks: {
        ...prevBoards.tasks,
        [taskId]: {
          ...prevBoards.tasks[taskId],
          title: newTitle,
        },
      },
    }));
  }, []);

  /**
   * Delete a task from a column
   */
  const deleteTask = useCallback((columnId, taskId) => {
    setBoards((prevBoards) => {
      const newBoards = { ...prevBoards };
      if (newBoards.boardData[columnId]) {
        newBoards.boardData[columnId].taskIds = newBoards.boardData[columnId].taskIds.filter(
          (id) => id !== taskId
        );
      }
      return newBoards;
    });
  }, []);

  /**
   * Update task checklist
   */
  const updateTaskChecklist = useCallback((taskId, checklist) => {
    setBoards((prevBoards) => ({
      ...prevBoards,
      tasks: {
        ...prevBoards.tasks,
        [taskId]: {
          ...prevBoards.tasks[taskId],
          checklist,
        },
      },
    }));
  }, []);

  /**
   * Add checklist to a task
   */
  const addChecklistToTask = useCallback((taskId, checklist) => {
    setBoards((prevBoards) => {
      const currentChecklist = prevBoards.tasks[taskId]?.checklist || [];
      return {
        ...prevBoards,
        tasks: {
          ...prevBoards.tasks,
          [taskId]: {
            ...prevBoards.tasks[taskId],
            checklist: [...currentChecklist, checklist],
          },
        },
      };
    });
  }, []);

  /**
   * Update checklist task checkbox state
   */
  const updateChecklistTaskCheckbox = useCallback(
    (taskId, checkListId, checkListTaskId, checked) => {
      setBoards((prevBoards) => {
        const newBoards = { ...prevBoards };
        const task = newBoards.tasks[taskId];
        if (task && task.checklist) {
          const updatedChecklist = task.checklist.map((checklistItem) => {
            if (checklistItem.id === checkListId) {
              return {
                ...checklistItem,
                checkListTask: checklistItem.checkListTask.map((checklistTask) => {
                  if (checklistTask.id === checkListTaskId) {
                    return { ...checklistTask, checked };
                  }
                  return checklistTask;
                }),
              };
            }
            return checklistItem;
          });
          newBoards.tasks[taskId] = {
            ...task,
            checklist: updatedChecklist,
          };
        }
        return newBoards;
      });
    },
    []
  );

  return {
    boards,
    setBoards,
    createTask,
    removeTask,
    deleteColumn,
    addColumn,
    updateColumnTitle,
    updateTaskTitle,
    deleteTask,
    updateTaskChecklist,
    addChecklistToTask,
    updateChecklistTaskCheckbox,
  };
};

