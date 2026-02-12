import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Input, App } from 'antd';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { Button } from '../../../../components/buttons/buttons';
import { BasicFormWrapper } from '../../../styled';
import Heading from '../../../../components/heading/heading';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../../../config/api/axios';
import { login } from '../../../../redux/authentication/actionCreator';

function Profile() {
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.auth.login);
  const dispatch = useDispatch();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const authUser = typeof authState === 'object' && authState ? authState : null;
        if (!authUser?.id) {
          if (authUser) {
            let roleLabel = 'Colaborador';
            if (authUser.role === 'admin') roleLabel = 'Gestor';
            else if (authUser.role === 'operational') roleLabel = 'Operacional';
            else if (authUser.role === 'health') roleLabel = 'Profissional de Saúde';

            form.setFieldsValue({
              name: authUser.name,
              email: authUser.email,
              function_role: authUser.function_role,
              role: roleLabel,
              employment_type: 'Efetivo',
            });
          }
          setLoading(false);
          return;
        }
        if (!authUser.professional_id) {
          setLoading(false);
          return;
        }
        const { data } = await api.get(`/professionals/${authUser.professional_id}`);
        setProfessional(data);

        let roleLabel = 'Colaborador';
        if (data.role === 'admin') roleLabel = 'Gestor';
        else if (data.role === 'operational') roleLabel = 'Operacional';
        else if (data.role === 'health') roleLabel = 'Profissional de Saúde';

        let employmentLabel = 'Efetivo';
        if (data.employment_type === 'volunteer') employmentLabel = 'Voluntário';

        form.setFieldsValue({
          name: data.name,
          email: data.email,
          function_role: data.function_role,
          role: roleLabel,
          employment_type: employmentLabel,
        });
      } catch (error) {
        const authUser = typeof authState === 'object' && authState ? authState : null;
        const status = error.response?.status;

        if (status === 404 && authUser) {
          let roleLabel = 'Colaborador';
          if (authUser.role === 'admin') roleLabel = 'Gestor';
          else if (authUser.role === 'operational') roleLabel = 'Operacional';
          else if (authUser.role === 'health') roleLabel = 'Profissional de Saúde';

          form.setFieldsValue({
            name: authUser.name,
            email: authUser.email,
            function_role: authUser.function_role,
            role: roleLabel,
            employment_type: 'Efetivo',
            bio: authUser.bio,
            phone: authUser.phone,
            website: authUser.website,
            skills: authUser.skills,
          });
        } else {
          notification.error({
            message: 'Erro ao carregar perfil',
            description: error.response?.data?.detail || error.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authState, form, notification]);

  const handleSubmit = async (values) => {
    if (!professional) {
      notification.error({
        message: 'Perfil não encontrado',
        description:
          'Cadastre este colaborador na Lista de Colaboradores para poder editar o perfil.',
      });
      return;
    }
    setLoading(true);
    try {
      const updated = {
        ...professional,
        name: values.name,
        function_role: values.function_role,
        bio: values.bio,
        phone: values.phone,
        website: values.website,
        skills: values.skills,
      };

      await api.put(`/professionals/${professional.id}`, updated);

      setProfessional(updated);

      const currentAuthUser =
        typeof authState === 'object' && authState ? authState : {};

      const authUser = {
        ...currentAuthUser,
        professional_id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status || currentAuthUser.status || 'active',
        bio: updated.bio,
        phone: updated.phone,
        website: updated.website,
        skills: updated.skills,
      };

      await dispatch(login(authUser));

      notification.success({
        message: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      notification.error({
        message: 'Erro ao atualizar perfil',
        description: error.response?.data?.detail || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Cards
      title={
        <div className="setting-card-title">
          <Heading as="h4">Perfil</Heading>
          <span>Atualize suas informações pessoais</span>
        </div>
      }
    >
      <Row justify="center">
        <Col xl={12} lg={16} xs={24}>
          <BasicFormWrapper>
            <Form layout="vertical" form={form} name="editarPerfil" onFinish={handleSubmit}>
              <Form.Item
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="bio" label="Biografia">
                <Input.TextArea rows={3} placeholder="Conte um pouco sobre você..." />
              </Form.Item>
              <Form.Item name="skills" label="Especialidades">
                <Input placeholder="Separe por vírgulas (Ex: Fisioterapia, Pediatria)" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="phone" label="Telefone/WhatsApp">
                        <Input placeholder="(99) 99999-9999" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="website" label="Site/LinkedIn">
                        <Input placeholder="https://..." />
                    </Form.Item>
                </Col>
              </Row>
              <Form.Item name="email" label="E-mail">
                <Input disabled />
              </Form.Item>
              <Form.Item name="function_role" label="Função">
                <Input />
              </Form.Item>
              <Form.Item name="role" label="Nível de acesso">
                <Input disabled />
              </Form.Item>
              <Form.Item name="employment_type" label="Tipo de vínculo">
                <Input disabled />
              </Form.Item>
              <div className="setting-form-actions">
                <Button size="default" htmlType="submit" type="primary" loading={loading}>
                  Salvar perfil
                </Button>
              </div>
            </Form>
          </BasicFormWrapper>
        </Col>
      </Row>
    </Cards>
  );
}

export default Profile;
