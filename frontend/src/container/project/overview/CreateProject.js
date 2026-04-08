import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Col, Row, DatePicker, App } from 'antd';
import propTypes from 'prop-types';
import { Button } from '../../../components/buttons/buttons';
import { Modal } from '../../../components/modals/antd-modals';
import { BasicFormWrapper } from '../../styled';
import { useDispatch } from 'react-redux';
import { createProject, filterProjectByStatus } from '../../../redux/project/actionCreator';
import api from '../../../config/api/axios';

const { Option } = Select;
const dateFormat = 'DD/MM/YYYY';

function CreateProject({ visible, onCancel }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { notification } = App.useApp();

  const [state, setState] = useState({
    visible,
    modalType: 'primary',
  });

  const [participantsOptions, setParticipantsOptions] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    let unmounted = false;

    const syncVisible = () => {
      setState((prevState) => ({
        ...prevState,
        visible,
      }));
    };

    const fetchParticipants = async () => {
      setLoadingParticipants(true);
      try {
        const response = await api.get('/professionals/basic');
        if (!unmounted) {
          const rows = response.data || [];
          const options = rows.map((p) => ({
            value: String(p.id),
            label: p.name,
          }));
          setParticipantsOptions(options);
        }
      } catch (e) {
        if (!unmounted) {
          const description =
            e?.response?.data?.detail || e.message || 'Erro desconhecido ao carregar participantes';
          notification.error({
            message: 'Erro ao carregar participantes',
            description,
          });
        }
      } finally {
        if (!unmounted) {
          setLoadingParticipants(false);
        }
      }
    };

    syncVisible();

    if (visible) {
      fetchParticipants();
    }

    return () => {
      unmounted = true;
    };
  }, [visible, notification]);

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      type={state.modalType}
      title="Criar projeto"
      visible={state.visible}
      footer={[
        <div key="1" className="project-modal-footer">
          <Button size="default" type="white" key="back" outlined onClick={handleCancel}>
            Cancelar
          </Button>
          <Button size="default" type="primary" key="submit" onClick={handleOk}>
            Criar projeto
          </Button>
        </div>,
      ]}
      onCancel={handleCancel}
    >
      <div className="project-modal">
        <BasicFormWrapper>
          <Form
            layout="vertical"
            form={form}
            name="createProject"
            onFinish={async (values) => {
              const membersValue = values.members || [];
              const participants =
                membersValue
                  .map((entry) => {
                    const option = participantsOptions.find((opt) => opt.value === entry);
                    if (option) {
                      return { name: option.label };
                    }
                    const trimmed = String(entry).trim();
                    if (!trimmed) return null;
                    return { name: trimmed };
                  })
                  .filter((item) => item) || [];

              const payload = {
                title: values.project,
                description: values.description,
                category: values.category || null,
                status: 'progress',
                progress: 0,
                total_tasks: 0,
                completed_tasks: 0,
                budget: null,
                spendings: null,
                hours_spent: null,
                start_date: values.start ? values.start.format('YYYY-MM-DD') : null,
                end_date: values.end ? values.end.format('YYYY-MM-DD') : null,
                owner: null,
                participants,
              };

              try {
                await dispatch(createProject(payload));
                await dispatch(filterProjectByStatus('all'));
                notification.success({
                  message: 'Projeto criado com sucesso',
                });
                form.resetFields();
                onCancel();
              } catch (e) {
                let description = e?.response?.data?.detail || e.message || 'Erro desconhecido ao criar o projeto';
                if (e?.response?.data?.detail && typeof e.response.data.detail !== 'string') {
                  try {
                    description = JSON.stringify(e.response.data.detail);
                  } catch {
                    description = 'Erro ao criar projeto (detalhes indisponíveis)';
                  }
                }
                notification.error({
                  message: 'Erro ao criar projeto',
                  description,
                });
              }
            }}
          >
            <Form.Item name="project" label="" rules={[{ required: true, message: 'Informe o nome do projeto' }]}>
              <Input placeholder="Nome do projeto" />
            </Form.Item>
            <Form.Item name="category" initialValue="" label="">
              <Select className="w-100">
                <Option value="">Categoria do projeto</Option>
                <Option value="health">Saúde</Option>
                <Option value="education">Educação</Option>
                <Option value="social">Assistência social</Option>
              </Select>
            </Form.Item>
            <Form.Item name="description" label="">
              <Input.TextArea rows={4} placeholder="Descrição do projeto" />
            </Form.Item>
            <Form.Item name="members" label="Participantes">
              <Select
                className="w-100"
                mode="tags"
                placeholder="Selecione participantes ou digite novos nomes"
                loading={loadingParticipants}
                options={participantsOptions}
                optionFilterProp="label"
                showSearch
              />
            </Form.Item>
            <Row gutter={15}>
              <Col md={12}>
                <Form.Item name="start" label="Data de início">
                  <DatePicker placeholder="dd/mm/aaaa" format={dateFormat} />
                </Form.Item>
              </Col>
              <Col md={12}>
                <Form.Item name="end" label="Data de término">
                  <DatePicker placeholder="dd/mm/aaaa" format={dateFormat} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

CreateProject.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
};

export default CreateProject;
