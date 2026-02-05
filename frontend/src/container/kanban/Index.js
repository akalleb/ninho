/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Row, Col } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { KanvanBoardWrap, BackShadow } from './style';
import UpdateTask from './overview/UpdateTask';
import KanbanColumn from './overview/KanbanColumn';
import ColumnAdder from './components/ColumnAdder';
import AddColumnButton from './components/AddColumnButton';
import { Main } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../components/buttons/calendar-button/calendar-button';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import { useKanbanUI } from './hooks/useKanbanUI';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useChecklist } from './hooks/useChecklist';
import kanbanData from '../../demoData/kanbanBoard';

const Kanban = () => {
  // Custom hooks for separated concerns
  const {
    boards,
    setBoards,
    createTask,
    removeTask,
    deleteColumn,
    addColumn: addColumnToBoard,
    updateColumnTitle,
    updateTaskTitle,
    deleteTask,
    addChecklistToTask,
    updateChecklistTaskCheckbox,
  } = useKanbanBoard(kanbanData);

  const {
    modalVisible,
    backShadow,
    editableTaskId,
    checkListPopup,
    editable,
    checklistData,
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
  } = useKanbanUI();

  const { onDragEnd } = useDragAndDrop(boards, setBoards);

  const {
    addChecklist,
    addChecklistTask,
    toggleChecklistTaskCheckbox,
  } = useChecklist(boards, addChecklistToTask, updateChecklistTaskCheckbox);

  // Column addition UI state
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);

  // Wrapper functions that integrate hooks with component logic
  const handleAddColumn = (columnTitle) => {
    addColumnToBoard(columnTitle);
    setShowAddColumnForm(false);
  };

  const handleCreateTask = (name, card, columnId) => {
    createTask(name, card, columnId);
  };

  const handleRemoveTask = (card, columnId) => {
    removeTask(card, columnId);
  };

  const handleDeleteColumn = (columnId) => {
    deleteColumn(columnId);
  };

  const handleUpdateTaskTitle = (value, taskId) => {
    updateTaskTitle(taskId, value);
    resetUIState();
  };

  const handleDeleteTask = (columnId, taskId) => {
    deleteTask(columnId, taskId);
    resetUIState();
  };

  const handleShowModal = (data) => {
    toggleModal(data);
    updateChecklistData(data);
  };

  // Checklist handlers that work with DOM (legacy code needs refactoring in UpdateTask)
  // These handlers bridge the gap between the UpdateTask component's DOM queries and our hooks
  const handleAddChecklist = (taskId) => {
    const checklistTitle = document.querySelector(`input[name="checkListInputValue"]`)?.value;
    if (checklistTitle) {
      const updatedChecklist = addChecklist(taskId, checklistTitle);
      if (updatedChecklist.length > 0) {
        updateChecklistData({ ...checklistData, checklist: updatedChecklist });
      }
      cancelTaskEdit();
    }
  };

  const handleAddChecklistTask = (taskId, selectedCheckList) => {
    const taskTitle = document.querySelector(`input[name="checkListAddInputValue"]`)?.value;
    if (taskTitle && selectedCheckList) {
      const updatedChecklist = addChecklistTask(taskId, selectedCheckList, taskTitle);
      if (updatedChecklist.length > 0) {
        // Update the boards state with the new checklist task
        const currentTask = boards.tasks[taskId];
        if (currentTask) {
          setBoards((prevBoards) => ({
            ...prevBoards,
            tasks: {
              ...prevBoards.tasks,
              [taskId]: {
                ...currentTask,
                checklist: updatedChecklist,
              },
            },
          }));
        }
      }
      hideChecklistPopup();
    }
  };

  const handleChecklistTaskCheckbox = (value, taskId, checkListId, checkListTaskId) => {
    toggleChecklistTaskCheckbox(taskId, checkListId, checkListTaskId, value);
    hideChecklistPopup();
  };

  return (
    <>
      <PageHeader
        title="Kanban"
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
        <Row gutter={15}>
          <Col xs={24}>
            <KanvanBoardWrap>
              <Cards headless title="Product Design">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="all-columns" direction="horizontal" type="column">
                    {provided => (
                      <div className="sDash_kanban-board-list" {...provided.droppableProps} ref={provided.innerRef}>
                        {boards.boardOrder.map((boardItem, index) => {
                          const board = boards.boardData[boardItem];
                          const tasks = board.taskIds.map((taskId) => boards.tasks[taskId]).filter(Boolean);
                          return (
                            <KanbanColumn
                              board={board}
                              key={board.id}
                              tasks={tasks}
                              index={index}
                              createBoard={handleCreateTask}
                              removeBoard={handleRemoveTask}
                              showModal={handleShowModal}
                              onBackShadow={showBackShadow}
                              data={boards}
                              deleteBoard={handleDeleteColumn}
                              editColumnTitle={updateColumnTitle}
                              editableTaskId={editableTaskId}
                              handleTaskEditable={showBackShadow}
                              handleTaskTitleUpdate={handleUpdateTaskTitle}
                              handleTaskDelete={handleDeleteTask}
                            />
                          );
                        })}
                        {showAddColumnForm ? (
                          <ColumnAdder
                            onAddColumn={handleAddColumn}
                            onCancel={() => setShowAddColumnForm(false)}
                          />
                        ) : (
                          <AddColumnButton onClick={() => setShowAddColumnForm(true)} />
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Cards>
            </KanvanBoardWrap>
          </Col>
        </Row>
      </Main>
      <UpdateTask
        handleCancel={closeModal}
        modalVisible={modalVisible}
        data={checklistData}
        checkListPopup={checkListPopup}
        addChecklist={handleAddChecklist}
        addChecklistTask={handleAddChecklistTask}
        onShowChecklistAddPopup={showChecklistPopup}
        onHideChecklistAddPopup={hideChecklistPopup}
        handleChecklistTaskCheckbox={handleChecklistTaskCheckbox}
        editable={editable}
        handleTaskEdit={toggleTaskEdit}
        onCancelTaskEdit={cancelTaskEdit}
      />
      {backShadow && <BackShadow onClick={hideBackShadow} />}
    </>
  );
};

export default Kanban;