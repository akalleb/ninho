'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Row, Col, Spin, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { KanvanBoardWrap, BackShadow } from '../kanban/style';
import KanbanColumn from '../kanban/overview/KanbanColumn';
import ColumnAdder from '../kanban/components/ColumnAdder';
import AddColumnButton from '../kanban/components/AddColumnButton';
import UpdateTask from '../kanban/overview/UpdateTask';
import { useKanbanBoard } from '../kanban/hooks/useKanbanBoard';
import { useKanbanUI } from '../kanban/hooks/useKanbanUI';
import { useDragAndDrop } from '../kanban/hooks/useDragAndDrop';
import { useChecklist } from '../kanban/hooks/useChecklist';
import { filterSinglePage } from '../../redux/project/actionCreator';

function ProjectKanban() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { notification } = App.useApp();

  const slug = params?.slug || [];
  const projectId = useMemo(() => {
    if (Array.isArray(slug) && slug.length > 1) return slug[1];
    if (Array.isArray(slug) && slug.length === 1) return slug[0];
    return params?.id || '';
  }, [slug, params]);

  const projectState = useSelector((state) => state.project);

  useEffect(() => {
    if (dispatch && projectId) {
      const id = parseInt(projectId, 10);
      if (!Number.isNaN(id)) {
        dispatch(filterSinglePage(id));
      }
    }
  }, [dispatch, projectId]);

  const currentProject = useMemo(() => {
    const data = projectState?.data;
    if (!Array.isArray(data) || !data.length) return null;
    return data[0] || null;
  }, [projectState?.data]);

  const initialEmptyBoard = {
    tasks: {},
    boardData: {
      board_todo: {
        id: 'board_todo',
        title: 'A Fazer',
        taskIds: [],
      },
      board_in_progress: {
        id: 'board_in_progress',
        title: 'Em andamento',
        taskIds: [],
      },
      board_done: {
        id: 'board_done',
        title: 'Concluído',
        taskIds: [],
      },
    },
    boardOrder: ['board_todo', 'board_in_progress', 'board_done'],
  };

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
  } = useKanbanBoard(initialEmptyBoard);

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

  const { addChecklist, addChecklistTask, toggleChecklistTaskCheckbox } = useChecklist(
    boards,
    addChecklistToTask,
    updateChecklistTaskCheckbox,
  );

  const [showAddColumnForm, setShowAddColumnForm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !projectId) return;
    try {
      const stored = window.localStorage.getItem(`project-kanban-${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.tasks && parsed.boardData && parsed.boardOrder) {
          setBoards(parsed);
        }
      }
    } catch {
      notification.info({
        message: 'Não foi possível carregar o quadro salvo',
      });
    }
  }, [projectId, setBoards, notification]);

  useEffect(() => {
    if (typeof window === 'undefined' || !projectId) return;
    try {
      window.localStorage.setItem(`project-kanban-${projectId}`, JSON.stringify(boards));
    } catch {
    }
  }, [boards, projectId]);

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

  const title = currentProject?.title || 'Quadro Kanban';

  if (!projectId) {
    return (
      <Main>
        <Cards>
          <Spin />
        </Cards>
      </Main>
    );
  }

  return (
    <>
      <PageHeader
        ghost
        title={
          <div className="project-header">
            <span>{title}</span>
            <Button
              size="small"
              type="default"
              onClick={() => router.push(`/admin/project/projectDetails/${projectId}`)}
            >
              <FeatherIcon icon="arrow-left" size={14} /> Voltar para detalhes
            </Button>
          </div>
        }
      />
      <Main>
        <Row gutter={15}>
          <Col xs={24}>
            <KanvanBoardWrap>
              <Cards headless title="Quadro Kanban do Projeto">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="all-columns" direction="horizontal" type="column">
                    {(provided) => (
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
                          <ColumnAdder onAddColumn={handleAddColumn} onCancel={() => setShowAddColumnForm(false)} />
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
}

export default ProjectKanban;
