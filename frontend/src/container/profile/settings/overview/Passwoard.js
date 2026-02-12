import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, App } from 'antd';
import { ChangePasswordWrapper } from './style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { BasicFormWrapper } from '../../../styled';
import Heading from '../../../../components/heading/heading';
import { useSelector } from 'react-redux';
import api from '../../../../config/api/axios';

function Password() {
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.auth.login);
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    const authUser = typeof authState === 'object' && authState ? authState : null;
    if (!authUser || !authUser.professional_id) {
      notification.error({
        message: 'Usuário não identificado',
        description: 'Faça login novamente para alterar a senha.',
      });
      return;
    }

    try {
      setLoading(true);
      await api.post(`/professionals/${authUser.professional_id}/password`, {
        old_password: values.old,
        new_password: values.new,
      });
      notification.success({
        message: 'Senha atualizada com sucesso',
      });
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Erro ao alterar senha',
        description: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = (e) => {
    e.preventDefault();
    form.resetFields();
  };

  return (
    <ChangePasswordWrapper>
      <Cards
        title={
          <div className="setting-card-title">
            <Heading as="h4">Senha</Heading>
            <span>Altere sua senha de acesso ao Ninho</span>
          </div>
        }
      >
        <Row justify="center">
          <Col lg={12} sm={20} xs={24}>
            <BasicFormWrapper>
              <Form layout="vertical" form={form} name="changePassword" onFinish={handleSubmit}>
                <Form.Item
                  name="old"
                  label="Senha atual"
                  rules={[{ required: true, message: 'Informe a senha atual' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="new"
                  label="Nova senha"
                  rules={[{ required: true, message: 'Informe a nova senha' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirm"
                  label="Confirmar nova senha"
                  dependencies={['new']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const pwd = getFieldValue('new');
                        if (!pwd && !value) {
                          return Promise.resolve();
                        }
                        if (pwd && value !== pwd) {
                          return Promise.reject(new Error('As senhas não coincidem'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <p className="input-message">Mínimo de 6 caracteres.</p>
                <Form.Item>
                  <div className="setting-form-actions">
                    <Button htmlType="submit" type="primary" loading={loading}>
                      Alterar senha
                    </Button>
                    &nbsp; &nbsp;
                    <Button size="default" onClick={handleCancel} type="light">
                      Cancelar
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </BasicFormWrapper>
          </Col>
        </Row>
      </Cards>
    </ChangePasswordWrapper>
  );
}

export default Password;
