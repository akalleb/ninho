'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, App, Checkbox, Tag } from 'antd';
import { useParams, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import api from '../../../config/api/axios';
import { filterSinglePage } from '../../../redux/project/actionCreator';

function TaskList() {
  const params = useParams();
  const { message } = App.useApp();
  const dispatch = useDispatch();
  const projectId = Array.isArray(params?.slug) && params.slug.length > 1 ? params.slug[1] : params?.id || params?.slug?.[0];
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();

  const loadTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/tasks/`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('Erro ao carregar tarefas do projeto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  useEffect(() => {
    const shouldOpen = searchParams?.get('newTask') === '1';
    if (shouldOpen) {
      openNewTaskModal();
    }
  }, [searchParams, projectId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = () => {
      openNewTaskModal();
    };
    window.addEventListener('openProjectNewTaskModal', handler);
    return () => {
      window.removeEventListener('openProjectNewTaskModal', handler);
    };
  }, [projectId]);

  const openNewTaskModal = () => {
    setEditingTask(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    if (!projectId) return;
    const payload = {
      title: values.title,
      description: values.description || null,
      status: values.status || undefined,
      due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
    };
    try {
      if (editingTask) {
        await api.put(`/projects/${projectId}/tasks/${editingTask.id}`, payload);
        message.success('Tarefa atualizada com sucesso.');
      } else {
        await api.post(`/projects/${projectId}/tasks/`, payload);
        message.success('Tarefa criada com sucesso.');
      }
      setModalOpen(false);
      await loadTasks();
      const idNum = parseInt(projectId, 10);
      if (!Number.isNaN(idNum)) {
        await dispatch(filterSinglePage(idNum));
      }
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      message.error(detail || 'Erro ao salvar tarefa.');
    }
  };

  const handleStatusChange = async (task, status) => {
    if (!projectId) return;
    try {
      await api.put(`/projects/${projectId}/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status,
        due_date: task.due_date,
      });
      await loadTasks();
      const idNum = parseInt(projectId, 10);
      if (!Number.isNaN(idNum)) {
        await dispatch(filterSinglePage(idNum));
      }
    } catch (e) {
      message.error('Erro ao atualizar status da tarefa.');
    }
  };

  const handleToggleDone = async (task, checked) => {
    const newStatus = checked ? 'completed' : 'pending';
    await handleStatusChange(task, newStatus);
  };

  const columns = [
    {
      title: '',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        const completed = record.status === 'completed';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              checked={completed}
              onChange={(e) => handleToggleDone(record, e.target.checked)}
            />
            <span
              style={{
                textDecoration: completed ? 'line-through' : 'none',
                color: completed ? '#999' : 'inherit',
                fontWeight: completed ? 400 : 500,
              }}
            >
              {text}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (val) => val || '-',
    },
    {
      title: 'Prazo',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (val) => (val ? new Date(val).toLocaleDateString('pt-BR') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'default';
        let label = 'Pendente';
        if (status === 'in_progress') {
          color = 'blue';
          label = 'Em andamento';
        } else if (status === 'completed') {
          color = 'green';
          label = 'Concluída';
        }
        return (
          <Tag color={color}>{label}</Tag>
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" onClick={() => openEditTaskModal(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="task-list-inner table-responsive">
      <Table pagination={false} dataSource={tasks} columns={columns} rowKey="id" loading={loading} />
      <div className="tasklist-action">
        <Button type="primary" size="large" onClick={openNewTaskModal}>
          Adicionar nova tarefa
        </Button>
      </div>
      <Modal
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: 'Informe o título da tarefa' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="due_date" label="Prazo">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status inicial">
            <Select allowClear>
              <Select.Option value="pending">Pendente</Select.Option>
              <Select.Option value="in_progress">Em andamento</Select.Option>
              <Select.Option value="completed">Concluída</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Salvar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TaskList;
