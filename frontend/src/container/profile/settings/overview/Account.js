import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, App } from 'antd';
import { AccountWrapper } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { BasicFormWrapper } from '../../../styled';
import Heading from '../../../../components/heading/heading';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../../../config/api/axios';
import { login } from '../../../../redux/authentication/actionCreator';

function Account() {
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.auth.login);
  const dispatch = useDispatch();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const authUser = typeof authState === 'object' && authState ? authState : null;
        if (!authUser?.id) {
          if (authUser) {
            form.setFieldsValue({
              name: authUser.name,
              email: authUser.email,
              address: '',
              bank_data: '',
            });
          }
          setLoading(false);
          return;
        }
        const { data } = await api.get(`/professionals/${authUser.id}`);
        setProfessional(data);
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          address: data.address,
          bank_data: data.bank_data,
        });
      } catch (error) {
        const authUser = typeof authState === 'object' && authState ? authState : null;
        const status = error.response?.status;

        if (status === 404 && authUser) {
          form.setFieldsValue({
            name: authUser.name,
            email: authUser.email,
            address: '',
            bank_data: '',
          });
        } else {
          notification.error({
            message: 'Erro ao carregar conta',
            description: error.response?.data?.detail || error.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [authState, form, notification]);

  const handleSubmit = async (values) => {
    if (!professional) {
      notification.error({
        message: 'Conta não encontrada',
        description:
          'Cadastre este colaborador na Lista de Colaboradores para poder editar a conta.',
      });
      return;
    }
    setLoading(true);
    try {
      const updated = {
        ...professional,
        name: values.name,
        email: values.email,
        address: values.address,
        bank_data: values.bank_data,
      };

      await api.put(`/professionals/${professional.id}`, updated);

      setProfessional(updated);

      const authUser = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status || 'active',
      };
      await dispatch(login(authUser));

      notification.success({
        message: 'Conta atualizada com sucesso',
      });
    } catch (error) {
      notification.error({
        message: 'Erro ao atualizar conta',
        description: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (professional) {
      form.setFieldsValue({
        name: professional.name,
        email: professional.email,
        address: professional.address,
        bank_data: professional.bank_data,
      });
    } else {
      form.resetFields();
    }
  };

  return (
    <AccountWrapper>
      <Cards
        title={
          <div className="setting-card-title">
            <Heading as="h4">Conta</Heading>
            <span>Atualize seus dados de acesso e contato</span>
          </div>
        }
      >
        <Row>
          <Col xs={24}>
            <BasicFormWrapper>
              <Form layout="vertical" form={form} name="editAccount" onFinish={handleSubmit}>
                <div className="account-form-top">
                  <Row justify="center">
                    <Col xxl={10} lg={16} md={18} xs={24}>
                      <div className="account-form">
                        <Form.Item
                          name="name"
                          label="Nome"
                          rules={[{ required: true, message: 'Nome é obrigatório' }]}
                        >
                          <Input />
                        </Form.Item>
                        <p>
                          Seu e-mail será utilizado para acessar o sistema.
                        </p>
                        <Form.Item
                          name="email"
                          rules={[
                            { required: true, message: 'E-mail é obrigatório' },
                            { type: 'email', message: 'Informe um e-mail válido' },
                          ]}
                          label="E-mail"
                        >
                          <Input />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="account-form-bottom">
                  <Row justify="center">
                    <Col xxl={10} lg={16} md={18} xs={24}>
                      <div className="account-closing">
                        <Row>
                          <Col lg={24} md={24} sm={24} xs={24}>
                            <Heading className="account-closing__title" as="h4">
                              Status da conta
                            </Heading>
                            <p>
                              Para ativar ou desativar sua conta, utilize a coluna <strong>Status</strong> na
                              Lista de Colaboradores (/admin/users/dataTable).
                            </p>
                          </Col>
                        </Row>
                      </div>
                      <div className="account-action">
                        <div className="setting-form-actions">
                          <Button size="default" htmlType="submit" type="primary" loading={loading}>
                            Salvar alterações
                          </Button>
                          &nbsp; &nbsp;
                          <Button size="default" onClick={handleCancel} type="light">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Form>
            </BasicFormWrapper>
          </Col>
        </Row>
      </Cards>
    </AccountWrapper>
  );
}

export default Account;
