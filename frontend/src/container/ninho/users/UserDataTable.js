import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Modal, App, Drawer, Descriptions, Tag, Avatar, Divider, Input, Checkbox } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import api from '../../../config/api/axios';
import { UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  ACCESS_FEATURES,
  getAccessConfigOptionsForRole,
  getDefaultAccessForRole,
  hasFeatureAccess,
} from '../../../utility/accessControl';

function UserDataTable() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProfessional, setViewingProfessional] = useState(null);
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [forceDeleteTarget, setForceDeleteTarget] = useState(null);
  const [forceDeleteImpact, setForceDeleteImpact] = useState(null);
  const [forceDeleteConfirmText, setForceDeleteConfirmText] = useState('');
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);
  const [forceDeleteMode, setForceDeleteMode] = useState('standard');
  const [forceDeleteReason, setForceDeleteReason] = useState('');
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessTarget, setAccessTarget] = useState(null);
  const [allowPages, setAllowPages] = useState([]);
  const [denyPages, setDenyPages] = useState([]);
  const [allowFeatures, setAllowFeatures] = useState([]);
  const [denyFeatures, setDenyFeatures] = useState([]);
  const router = useRouter();
  const authState = useSelector((state) => state.auth.login);
  const authUser = typeof authState === 'object' && authState ? authState : null;
  const { notification } = App.useApp();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const canCreate = hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsCreate);
  const canEdit = hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsEdit);
  const canDelete = hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsDelete);
  const canToggleStatus = hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsStatus);
  const canManageAccess = hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsAccessManage);
  const accessOptions = getAccessConfigOptionsForRole(accessTarget?.role);

  const getApiErrorMessage = (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const detail = data?.detail ?? data?.message ?? data?.error;

    if (typeof detail === 'string' && detail.trim()) {
      return status ? `${detail} (HTTP ${status})` : detail;
    }
    if (detail != null) {
      try {
        return status ? `${JSON.stringify(detail)} (HTTP ${status})` : JSON.stringify(detail);
      } catch (e) {
      }
    }
    if (status) return `Erro HTTP ${status} ao comunicar com o servidor.`;
    return error?.message || 'Falha de rede ou servidor indisponível.';
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/professionals/');
      setProfessionals(response.data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar colaboradores',
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleView = (record) => {
    setViewingProfessional(record);
  };

  const handleEdit = (id) => {
    router.push(`/admin/users/add-user?id=${id}`);
  };

  const openAccessConfig = async (record) => {
    if (!canManageAccess) return;
    try {
      const { data } = await api.get(`/professionals/${record.id}/access-overrides`);
      const defaults = getDefaultAccessForRole(record?.role);
      const denyPagesFromApi = data?.deny_pages || [];
      const denyFeaturesFromApi = data?.deny_features || [];
      const mergedAllowPages = Array.from(
        new Set([...(defaults.pages || []), ...(data?.allow_pages || [])]),
      ).filter((key) => !denyPagesFromApi.includes(key));
      const mergedAllowFeatures = Array.from(
        new Set([...(defaults.features || []), ...(data?.allow_features || [])]),
      ).filter((key) => !denyFeaturesFromApi.includes(key));
      setAccessTarget(record);
      setAllowPages(mergedAllowPages);
      setDenyPages(denyPagesFromApi);
      setAllowFeatures(mergedAllowFeatures);
      setDenyFeatures(denyFeaturesFromApi);
      setAccessModalOpen(true);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar permissões',
        description: getApiErrorMessage(error),
      });
    }
  };

  const saveAccessConfig = async () => {
    if (!accessTarget) return;
    setAccessSaving(true);
    try {
      const defaults = getDefaultAccessForRole(accessTarget?.role);
      const normalizedDenyPages = Array.from(new Set(denyPages || []));
      const normalizedDenyFeatures = Array.from(new Set(denyFeatures || []));
      const normalizedAllowPages = Array.from(
        new Set((allowPages || []).filter((key) => !normalizedDenyPages.includes(key))),
      );
      const normalizedAllowFeatures = Array.from(
        new Set((allowFeatures || []).filter((key) => !normalizedDenyFeatures.includes(key))),
      );
      const implicitDenyPages = (defaults.pages || []).filter(
        (key) => !normalizedAllowPages.includes(key),
      );
      const implicitDenyFeatures = (defaults.features || []).filter(
        (key) => !normalizedAllowFeatures.includes(key),
      );
      const finalDenyPages = Array.from(new Set([...normalizedDenyPages, ...implicitDenyPages]));
      const finalDenyFeatures = Array.from(
        new Set([...normalizedDenyFeatures, ...implicitDenyFeatures]),
      );
      const overridesAllowPages = normalizedAllowPages.filter(
        (key) => !(defaults.pages || []).includes(key),
      );
      const overridesAllowFeatures = normalizedAllowFeatures.filter(
        (key) => !(defaults.features || []).includes(key),
      );

      await api.put(`/professionals/${accessTarget.id}/access-overrides`, {
        access_overrides: {
          allow_pages: overridesAllowPages,
          deny_pages: finalDenyPages,
          allow_features: overridesAllowFeatures,
          deny_features: finalDenyFeatures,
        },
      });
      notification.success({
        message: 'Permissões atualizadas com sucesso',
      });
      setAccessModalOpen(false);
      setAccessTarget(null);
      fetchProfessionals();
    } catch (error) {
      notification.error({
        message: 'Erro ao salvar permissões',
        description: getApiErrorMessage(error),
      });
    } finally {
      setAccessSaving(false);
    }
  };

  const handleAllowPagesChange = (vals) => {
    const next = vals || [];
    setAllowPages(next);
    setDenyPages((prev) => (prev || []).filter((item) => !next.includes(item)));
  };

  const handleDenyPagesChange = (vals) => {
    const next = vals || [];
    setDenyPages(next);
    setAllowPages((prev) => (prev || []).filter((item) => !next.includes(item)));
  };

  const handleAllowFeaturesChange = (vals) => {
    const next = vals || [];
    setAllowFeatures(next);
    setDenyFeatures((prev) => (prev || []).filter((item) => !next.includes(item)));
  };

  const handleDenyFeaturesChange = (vals) => {
    const next = vals || [];
    setDenyFeatures(next);
    setAllowFeatures((prev) => (prev || []).filter((item) => !next.includes(item)));
  };

  const openForceDelete = async (record) => {
    setForceDeleteTarget(record);
    setForceDeleteConfirmText('');
    setForceDeleteImpact(null);
    setForceDeleteReason('');
    setForceDeleteMode('standard');
    setForceDeleteOpen(true);
  };

  const handleDelete = async (id) => {
    const record = professionals.find((p) => p.id === id);
    if (!record) return;
    await openForceDelete(record);
  };

  const fetchForceDeleteImpact = async (record) => {
    try {
      const { data } = await api.get(`/professionals/${record.id}/delete-impact`);
      setForceDeleteImpact(data);
    } catch (error) {
      notification.error({
        message: 'Erro ao calcular impacto da exclusão',
        description: getApiErrorMessage(error),
      });
    }
  };

  const submitForceDelete = async () => {
    if (!forceDeleteTarget) return;
    setForceDeleteLoading(true);
    try {
      if (forceDeleteMode === 'standard') {
        const resp = await api.delete(`/professionals/${forceDeleteTarget.id}`);
        const authDeleted = resp?.data?.auth_deleted;
        notification.success({ message: 'Colaborador excluído com sucesso' });
        if (authDeleted === false) {
          notification.warning({
            message: 'Atenção',
            description: 'O colaborador foi removido do sistema, mas o usuário ainda pode existir no Supabase Auth.',
          });
        }
        setForceDeleteOpen(false);
        setForceDeleteTarget(null);
        setForceDeleteImpact(null);
        setForceDeleteConfirmText('');
        setForceDeleteReason('');
        setForceDeleteMode('standard');
        fetchProfessionals();
        return;
      }

      const resp = await api.post(`/professionals/${forceDeleteTarget.id}/force-delete`, {
        confirm: forceDeleteConfirmText,
      });
      const authDeleted = resp?.data?.auth_deleted;
      notification.success({ message: 'Colaborador excluído com sucesso' });
      if (authDeleted === false) {
        notification.warning({
          message: 'Atenção',
          description: 'O colaborador foi removido do sistema, mas o usuário ainda pode existir no Supabase Auth.',
        });
      }
      setForceDeleteOpen(false);
      setForceDeleteTarget(null);
      setForceDeleteImpact(null);
      setForceDeleteConfirmText('');
      setForceDeleteReason('');
      setForceDeleteMode('standard');
      fetchProfessionals();
    } catch (error) {
      if (forceDeleteMode === 'standard' && error?.response?.status === 400) {
        setForceDeleteMode('force');
        setForceDeleteReason(getApiErrorMessage(error));
        await fetchForceDeleteImpact(forceDeleteTarget);
      } else {
        notification.error({
          message: forceDeleteMode === 'force' ? 'Não foi possível forçar a exclusão' : 'Erro ao excluir colaborador',
          description: getApiErrorMessage(error),
        });
      }
    } finally {
      setForceDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (record) => {
    if (!canToggleStatus) return;
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/professionals/${record.id}/status`, { status: newStatus });
      setProfessionals((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: newStatus } : item,
        ),
      );
      notification.success({
        message: 'Status atualizado',
      });
    } catch (error) {
      notification.error({
        message: 'Erro ao atualizar status',
        description: error.message,
      });
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar
                src={record.avatar_url ? `${apiBaseUrl}${record.avatar_url}` : undefined}
                icon={<UserOutlined />}
              />
              <span>{text}</span>
          </div>
      )
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vínculo',
      dataIndex: 'employment_type',
      key: 'employment_type',
      render: (type) => {
        if (!type) {
          return (
            <Tag
              style={{
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 14,
                padding: '2px 10px',
                backgroundColor: '#fafafa',
                color: '#8c8c8c',
                border: '1px dashed #d9d9d9',
              }}
            >
              Não informado
            </Tag>
          );
        }

        const isEffective = type === 'effective';
        const backgroundColor = isEffective ? '#e6f4ff' : '#f6ffed';
        const color = isEffective ? '#0958d9' : '#237804';
        const borderColor = isEffective ? '#91caff' : '#b7eb8f';
        const label = isEffective ? 'Efetivo' : 'Voluntário';

        return (
          <Tag
            style={{
              minWidth: 100,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 14,
              backgroundColor,
              color,
              border: `1px solid ${borderColor}`,
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Função',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        if (!role) {
          return (
            <Tag
              style={{
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 14,
                padding: '2px 10px',
                backgroundColor: '#fafafa',
                color: '#8c8c8c',
                border: '1px dashed #d9d9d9',
              }}
            >
              Não informado
            </Tag>
          );
        }

        let label = role;
        let backgroundColor = '#f5f5f5';
        let color = '#595959';
        let borderColor = '#d9d9d9';

        if (role === 'admin') {
          label = 'Gestor';
          backgroundColor = '#f9f0ff';
          color = '#531dab';
          borderColor = '#d3adf7';
        } else if (role === 'operational') {
          label = 'Operacional';
          backgroundColor = '#e6fffb';
          color = '#006d75';
          borderColor = '#87e8de';
        } else if (role === 'health') {
          label = 'Saúde';
          backgroundColor = '#fff0f6';
          color = '#c41d7f';
          borderColor = '#ffadd2';
        }

        return (
          <Tag
            style={{
              minWidth: 110,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 14,
              backgroundColor,
              color,
              border: `1px solid ${borderColor}`,
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Button
          size="small"
          type={status === 'active' ? 'primary' : 'default'}
          onClick={() => handleToggleStatus(record)}
          ghost={status !== 'active'}
          disabled={!canToggleStatus}
        >
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </Button>
      ),
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button 
                size="small" 
                type="default"
                icon={<FeatherIcon icon="eye" size={14} />}
                onClick={() => handleView(record)}
            />
            {canEdit && (
            <Button 
                size="small" 
                type="primary" 
                icon={<FeatherIcon icon="edit" size={14} />}
                onClick={() => handleEdit(record.id)}
            />
            )}
            {canDelete && (
            <Button 
                size="small" 
                type="primary"
                danger 
                icon={<FeatherIcon icon="trash-2" size={14} />}
                onClick={() => handleDelete(record.id)}
            />
            )}
            {canManageAccess && (
            <Button
                size="small"
                type="default"
                icon={<FeatherIcon icon="shield" size={14} />}
                onClick={() => openAccessConfig(record)}
            >
              Acessos
            </Button>
            )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        ghost
        title="Lista de Colaboradores"
        buttons={[
          <Button key="2" type="default" size="small" onClick={() => router.push('/admin/notifications')}>
             <FeatherIcon icon="bell" size={14} /> Gerenciar Notificações
          </Button>,
          canCreate ? (
          <Button key="1" type="primary" size="small" onClick={() => router.push('/admin/users/add-user')}>
            <FeatherIcon icon="plus" size={14} /> Adicionar Novo Colaborador
          </Button>
          ) : null,
        ].filter(Boolean)}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless>
              <Table
                className="table-responsive"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'Nenhum colaborador cadastrado' }}
                dataSource={professionals}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
              
              <Drawer
                width={640}
                placement="right"
                closable={true}
                onClose={() => setViewingProfessional(null)}
                open={!!viewingProfessional}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <Avatar size={64} src={viewingProfessional?.avatar_url} icon={<UserOutlined />} />
                        <div>
                            <h3 style={{ margin: 0 }}>{viewingProfessional?.name}</h3>
                            <span style={{ color: '#888' }}>{viewingProfessional?.email}</span>
                        </div>
                    </div>
                }
              >
                {viewingProfessional && (
                  <>
                    <Descriptions title="Informações Pessoais" column={1} bordered size="small">
                        <Descriptions.Item label="CPF">{viewingProfessional.cpf}</Descriptions.Item>
                        <Descriptions.Item label="RG">{viewingProfessional.rg || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Data de Nascimento">
                            {viewingProfessional.birth_date ? moment(viewingProfessional.birth_date).format('DD/MM/YYYY') : '-'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Descriptions title="Dados Profissionais" column={1} bordered size="small">
                         <Descriptions.Item label="Cargo / Função">{viewingProfessional.function_role || '-'}</Descriptions.Item>
                         <Descriptions.Item label="Perfil de Acesso">
                            {viewingProfessional.role === 'admin' ? 'Gestor' : viewingProfessional.role === 'operational' ? 'Operacional' : 'Profissional de Saúde'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Tipo de Vínculo">
                             {viewingProfessional.employment_type === 'effective' ? 'Efetivo' : 'Voluntário'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Data de Admissão">
                             {viewingProfessional.admission_date ? moment(viewingProfessional.admission_date).format('DD/MM/YYYY') : '-'}
                         </Descriptions.Item>
                         <Descriptions.Item label="Validade do Contrato">
                             {viewingProfessional.contract_validity ? moment(viewingProfessional.contract_validity).format('DD/MM/YYYY') : 'Indeterminado'}
                         </Descriptions.Item>
                         {viewingProfessional.role === 'health' && (
                             <>
                                <Descriptions.Item label="Especialidade">{viewingProfessional.specialty || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Registro Profissional">{viewingProfessional.registry_number || '-'}</Descriptions.Item>
                                <Descriptions.Item label="CBO">{viewingProfessional.cbo || '-'}</Descriptions.Item>
                                <Descriptions.Item label="CNS">{viewingProfessional.cns || '-'}</Descriptions.Item>
                             </>
                         )}
                    </Descriptions>

                    <Divider />

                    <Descriptions title="Contato e Endereço" column={1} bordered size="small">
                        <Descriptions.Item label="Telefone">{viewingProfessional.phone || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Endereço">{viewingProfessional.address || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Site / Portfolio">{viewingProfessional.website || '-'}</Descriptions.Item>
                    </Descriptions>
                    
                    <Divider />

                    <Descriptions title="Dados Bancários" column={1} bordered size="small">
                        <Descriptions.Item label="Banco / Pix">
                            <pre style={{ margin: 0, fontFamily: 'inherit' }}>{viewingProfessional.bank_data || '-'}</pre>
                        </Descriptions.Item>
                    </Descriptions>

                    {viewingProfessional.bio && (
                        <>
                            <Divider />
                            <h3>Bio / Observações</h3>
                            <p>{viewingProfessional.bio}</p>
                        </>
                    )}
                  </>
                )}
              </Drawer>
            </Cards>
          </Col>
        </Row>

        <Modal
          title={forceDeleteMode === 'force' ? 'Forçar exclusão do colaborador' : 'Excluir colaborador'}
          open={forceDeleteOpen}
          okText={forceDeleteMode === 'force' ? 'Excluir definitivamente' : 'Excluir'}
          okType="danger"
          cancelText="Cancelar"
          onCancel={() => {
            if (forceDeleteLoading) return;
            setForceDeleteOpen(false);
            setForceDeleteTarget(null);
            setForceDeleteImpact(null);
            setForceDeleteConfirmText('');
            setForceDeleteReason('');
            setForceDeleteMode('standard');
          }}
          onOk={submitForceDelete}
          confirmLoading={forceDeleteLoading}
          okButtonProps={{
            disabled:
              !forceDeleteTarget ||
              (forceDeleteMode === 'force' &&
                (forceDeleteConfirmText || '').trim().toLowerCase() !==
                  (forceDeleteTarget?.email || '').trim().toLowerCase()),
          }}
        >
          <p style={{ marginBottom: 12 }}>
            Você está prestes a excluir: <strong>{forceDeleteTarget?.name}</strong> ({forceDeleteTarget?.email})
          </p>

          {forceDeleteMode === 'standard' && (
            <p style={{ marginBottom: 0 }}>
              Se houver vínculos (atendimentos, evoluções, etc.), o sistema vai pedir confirmação adicional para forçar a exclusão.
            </p>
          )}

          {forceDeleteMode === 'force' && (
            <>
              {forceDeleteReason && (
                <p style={{ marginBottom: 12 }}>
                  <strong>Motivo:</strong> {forceDeleteReason}
                </p>
              )}

              {forceDeleteImpact && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Impacto estimado</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {Object.entries(forceDeleteImpact.references || {}).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Divider style={{ margin: '12px 0' }} />
              <p style={{ marginBottom: 8 }}>
                Para confirmar, digite o e-mail do colaborador:{' '}
                <strong>{forceDeleteTarget?.email}</strong>
              </p>
              <Input
                placeholder="Digite o e-mail para confirmar"
                value={forceDeleteConfirmText}
                onChange={(e) => setForceDeleteConfirmText(e.target.value)}
                disabled={forceDeleteLoading}
              />
            </>
          )}
        </Modal>

        <Modal
          title={`Permissões personalizadas: ${accessTarget?.name || ''}`}
          open={accessModalOpen}
          okText="Salvar permissões"
          cancelText="Cancelar"
          onCancel={() => {
            if (accessSaving) return;
            setAccessModalOpen(false);
            setAccessTarget(null);
          }}
          onOk={saveAccessConfig}
          confirmLoading={accessSaving}
          width={900}
        >
          <p style={{ marginBottom: 16 }}>
            Mantenha as restrições padrão por papel e ajuste permissões individuais liberando ou restringindo páginas e funções.
          </p>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <h4>Liberar páginas</h4>
              <Checkbox.Group
                options={accessOptions.pages}
                value={allowPages}
                onChange={handleAllowPagesChange}
              />
            </Col>
            <Col xs={24} md={12}>
              <h4>Restringir páginas</h4>
              <Checkbox.Group
                options={accessOptions.pages}
                value={denyPages}
                onChange={handleDenyPagesChange}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <h4>Liberar funções</h4>
              <Checkbox.Group
                options={accessOptions.features}
                value={allowFeatures}
                onChange={handleAllowFeaturesChange}
              />
            </Col>
            <Col xs={24} md={12}>
              <h4>Restringir funções</h4>
              <Checkbox.Group
                options={accessOptions.features}
                value={denyFeatures}
                onChange={handleDenyFeaturesChange}
              />
            </Col>
          </Row>
        </Modal>
      </Main>
    </>
  );
}

export default UserDataTable;
