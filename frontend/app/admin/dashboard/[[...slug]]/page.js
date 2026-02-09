'use client';

import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { Spin, Row, Col, Card, Button } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';
import { Main } from '../../../../src/container/styled';
import FeatherIcon from 'feather-icons-react';

const DashboardLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center h-100vh min-h-600">
    <Spin />
  </div>
);

const DashboardOverview = dynamic(() => import('../../../../src/container/dashboard/DashboardOverview'), { 
  ssr: false,
  loading: () => <DashboardLoading />,
});

const UserDataTable = dynamic(() => import('../../../../src/container/ninho/users/UserDataTable'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

const AddUser = dynamic(() => import('../../../../src/container/ninho/users/AddUser'), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

function OperationalDashboard() {
  return (
    <Main>
      <Row gutter={25} style={{ marginBottom: 25 }}>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            title="Atendimento e crianças"
            extra={null}
          >
            <p style={{ marginBottom: 12 }}>
              Acesso rápido às rotinas ligadas ao atendimento das crianças.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button
                type="primary"
                icon={<FeatherIcon icon="users" size={16} />}
                href="/admin/children"
              >
                Prontuário das Crianças
              </Button>
              <Button
                icon={<FeatherIcon icon="list" size={16} />}
                href="/admin/queue"
              >
                Fila de Atendimentos
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            variant="borderless"
            title="Comunicação e equipe"
            extra={null}
          >
            <p style={{ marginBottom: 12 }}>
              Funcionalidades ligadas à equipe e notificações internas.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Button
                icon={<FeatherIcon icon="bell" size={16} />}
                href="/admin/notifications"
              >
                Notificações
              </Button>
              <Button
                icon={<FeatherIcon icon="user-check" size={16} />}
                href="/admin/dashboard/users/dataTable"
              >
                Colaboradores
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Main>
  );
}

function DashboardRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';
  const subSlug = params?.slug?.[1] || '';
  const authUser = useSelector((state) =>
    typeof state.auth.login === 'object' && state.auth.login ? state.auth.login : null,
  );

  if (slug === 'users') {
    if (subSlug === 'dataTable') {
      return <UserDataTable />;
    }
    if (subSlug === 'add-user') {
      return <AddUser />;
    }
    return <UserDataTable />;
  }

  if (authUser && authUser.role === 'operational') {
    return <OperationalDashboard />;
  }

  return <DashboardOverview />;
}

export default withAdminLayoutNext(DashboardRoutesPage);
