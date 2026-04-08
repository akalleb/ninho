'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, App } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import api from '../../../config/api/axios';

const { Option } = Select;

function Warehouse() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemForm] = Form.useForm();
  const [movementForm] = Form.useForm();
  const { message } = App.useApp();

  const loadItems = async () => {
    setLoadingItems(true);
    try {
      const res = await api.get('/inventory/items/');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('Erro ao carregar itens de almoxarifado.');
    } finally {
      setLoadingItems(false);
    }
  };

  const loadMovements = async (itemId) => {
    setLoadingMovements(true);
    try {
      const params = itemId ? { item_id: itemId } : {};
      const res = await api.get('/inventory/movements/', { params });
      setMovements(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      message.error('Erro ao carregar movimentações.');
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadMovements();
  }, []);

  const openItemModal = () => {
    setSelectedItem(null);
    itemForm.resetFields();
    setItemModalOpen(true);
  };

  const openMovementModal = (item) => {
    setSelectedItem(item);
    movementForm.resetFields();
    movementForm.setFieldsValue({ item_id: item?.id, type: 'entrada' });
    setMovementModalOpen(true);
  };

  const handleItemSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        category: values.category || null,
        unit: values.unit || null,
        description: values.description || null,
        min_stock: values.min_stock != null ? Number(values.min_stock) : null,
        location: values.location || null,
        initial_stock: values.initial_stock != null ? Number(values.initial_stock) : 0,
      };
      await api.post('/inventory/items/', payload);
      message.success('Item cadastrado com sucesso.');
      setItemModalOpen(false);
      await loadItems();
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      message.error(detail || 'Erro ao salvar item.');
    }
  };

  const handleMovementSubmit = async (values) => {
    try {
      const payload = {
        item_id: values.item_id,
        type: values.type,
        quantity: Number(values.quantity),
        reference: values.reference || null,
        notes: values.notes || null,
      };
      await api.post('/inventory/movements/', payload);
      message.success('Movimentação registrada com sucesso.');
      setMovementModalOpen(false);
      await Promise.all([loadItems(), loadMovements(selectedItem?.id)]);
    } catch (e) {
      const detail = e.response?.data?.detail || e.message;
      message.error(detail || 'Erro ao registrar movimentação.');
    }
  };

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        if (!cat) return '-';
        const map = {
          cleaning: 'Limpeza',
          food: 'Gêneros alimentícios',
          supply: 'Insumos',
          equipment: 'Equipamentos',
          other: 'Outros',
        };
        return map[cat] || cat;
      },
    },
    {
      title: 'Unidade',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Estoque atual',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (val, record) => {
        const belowMin = record.min_stock != null && val < record.min_stock;
        return (
          <span style={{ color: belowMin ? '#ff4d4f' : undefined, fontWeight: belowMin ? 600 : 400 }}>
            {val ?? 0} {record.unit || ''}
          </span>
        );
      },
    },
    {
      title: 'Estoque mínimo',
      dataIndex: 'min_stock',
      key: 'min_stock',
      render: (val, record) => (val != null ? `${val} ${record.unit || ''}` : '-'),
    },
    {
      title: 'Local',
      dataIndex: 'location',
      key: 'location',
      render: (val) => val || '-',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" type="primary" onClick={() => openMovementModal(record)}>
          Registrar entrada/saída
        </Button>
      ),
    },
  ];

  const movementColumns = [
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? new Date(val).toLocaleString('pt-BR') : '-'),
    },
    {
      title: 'Item',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'entrada' ? 'green' : 'volcano'}>
          {type === 'entrada' ? 'Entrada' : 'Saída'}
        </Tag>
      ),
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val, record) => `${val} ${record.unit || ''}`,
    },
    {
      title: 'Referência',
      dataIndex: 'reference',
      key: 'reference',
      render: (val) => val || '-',
    },
    {
      title: 'Observações',
      dataIndex: 'notes',
      key: 'notes',
      render: (val) => val || '-',
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Almoxarifado"
        subTitle="Controle de entrada e saída de materiais"
        buttons={[
          <Button key="1" type="primary" onClick={openItemModal}>
            <FeatherIcon icon="plus" size={16} /> Novo item
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24} lg={14}>
            <Card
              title="Itens em estoque"
              extra={
                <Button icon={<FeatherIcon icon="refresh-ccw" size={14} />} size="small" onClick={loadItems}>
                  Atualizar
                </Button>
              }
            >
              <Table
                loading={loadingItems}
                dataSource={items}
                columns={itemColumns}
                rowKey="id"
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title="Últimas movimentações"
              extra={
                <Button
                  size="small"
                  icon={<FeatherIcon icon="refresh-ccw" size={14} />}
                  onClick={() => loadMovements(selectedItem?.id)}
                >
                  Atualizar
                </Button>
              }
            >
              <Table
                loading={loadingMovements}
                dataSource={movements}
                columns={movementColumns}
                rowKey="id"
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Main>

      <Modal
        title="Novo item de almoxarifado"
        open={itemModalOpen}
        onCancel={() => setItemModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={itemForm} onFinish={handleItemSubmit}>
          <Form.Item
            name="name"
            label="Nome do item"
            rules={[{ required: true, message: 'Informe o nome do item' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Categoria">
            <Select allowClear placeholder="Selecione">
              <Option value="cleaning">Produtos de limpeza</Option>
              <Option value="food">Gêneros alimentícios</Option>
              <Option value="supply">Insumos</Option>
              <Option value="equipment">Equipamentos</Option>
              <Option value="other">Outros</Option>
            </Select>
          </Form.Item>
          <Form.Item name="unit" label="Unidade (ex: un, cx, kg, L)">
            <Input />
          </Form.Item>
          <Form.Item name="min_stock" label="Estoque mínimo">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="initial_stock" label="Estoque inicial">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="Localização (sala, prateleira, etc.)">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Salvar
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedItem ? `Movimentar: ${selectedItem.name}` : 'Movimentação'}
        open={movementModalOpen}
        onCancel={() => setMovementModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={movementForm} onFinish={handleMovementSubmit}>
          <Form.Item name="item_id" label="Item" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="children"
              disabled={!!selectedItem}
              placeholder="Selecione o item"
            >
              {items.map((it) => (
                <Option key={it.id} value={it.id}>
                  {it.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
            <Select>
              <Option value="entrada">Entrada</Option>
              <Option value="saida">Saída</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantidade" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reference" label="Referência (NF, requisição, etc.)">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Warehouse;

