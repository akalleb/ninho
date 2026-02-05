import { useCallback } from 'react';

/**
 * Custom hook for handling drag and drop operations in Kanban
 * Manages column reordering and task moving between columns
 */
export const useDragAndDrop = (boards, setBoards) => {
  /**
   * Handle drag end event for both columns and tasks
   */
  const onDragEnd = useCallback(
    (results) => {
      const { destination, source, draggableId, type } = results;

      // If dropped outside a droppable area, do nothing
      if (!destination) {
        return;
      }

      // If dropped in the same position, do nothing
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Handle column reordering
      if (type === 'column') {
        const newBoardOrder = Array.from(boards.boardOrder);
        newBoardOrder.splice(source.index, 1);
        newBoardOrder.splice(destination.index, 0, draggableId);

        setBoards({
          ...boards,
          boardOrder: newBoardOrder,
        });
        return;
      }

      // Handle task movement
      const start = boards.boardData[source.droppableId];
      const finish = boards.boardData[destination.droppableId];

      if (!start || !finish) {
        return;
      }

      // If task is moved within the same column
      if (start === finish) {
        const newTaskIds = Array.from(start.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const newBoard = {
          ...start,
          taskIds: newTaskIds,
        };

        setBoards({
          ...boards,
          boardData: {
            ...boards.boardData,
            [newBoard.id]: newBoard,
          },
        });
        return;
      }

      // If task is moved to a different column
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      };

      setBoards({
        ...boards,
        boardData: {
          ...boards.boardData,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });
    },
    [boards, setBoards]
  );

  return { onDragEnd };
};

