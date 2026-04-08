import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, Form, Input, Select, notification, Tag } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';

const { Option } = Select;

function UserManagement() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/professionals/');
      setProfessionals(response.data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar usuários',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleCreate = async (values) => {
    try {
      await api.post('/professionals/', values);
      notification.success({
        message: 'Usuário criado com sucesso',
      });
      setModalVisible(false);
      form.resetFields();
      fetchProfessionals();
    } catch (error) {
      notification.error({
        message: 'Erro ao criar usuário',
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'geekblue';
        let label = role;
        if (role === 'admin') {
            color = 'red';
            label = 'Gestor';
        } else if (role === 'operational') {
            color = 'green';
            label = 'Operacional';
        } else if (role === 'health') {
            color = 'blue';
            label = 'Saúde';
        }
        return <Tag color={color}>{label.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Especialidade',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: 'Registro Profissional',
      dataIndex: 'registry_number',
      key: 'registry_number',
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Gerenciamento de Usuários"
        buttons={[
          <Button key="1" type="primary" size="small" onClick={() => setModalVisible(true)}>
            <FeatherIcon icon="plus" size={14} /> Adicionar Novo
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless>
              <Table
                className="table-responsive"
                pagination={false}
                dataSource={professionals}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
            </Cards>
          </Col>
        </Row>

        <Modal
          title="Novo Usuário"
          visible={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => setModalVisible(false)}
        >
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Por favor insira o nome' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Por favor insira o email' }]}>
              <Input type="email" />
            </Form.Item>
            <Form.Item name="role" label="Função" initialValue="admin">
              <Select>
                <Option value="admin">Gestor (Admin)</Option>
                <Option value="operational">Operacional (Social)</Option>
                <Option value="health">Profissional de Saúde</Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
            >
              {({ getFieldValue }) =>
                getFieldValue('role') === 'health' ? (
                  <>
                    <Form.Item name="specialty" label="Especialidade">
                      <Input placeholder="Ex: Pediatria, Psicologia" />
                    </Form.Item>
                    <Form.Item name="registry_number" label="Registro Profissional">
                      <Input placeholder="CRM, CRP, etc." />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default UserManagement;
