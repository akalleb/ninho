'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, App, Tag, Card, Statistic, Empty, Skeleton, Popconfirm } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { Main } from '../../styled';
import api from '../../../config/api/axios';
import { Cards } from '../../../components/cards/frame/cards-frame';

function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { notification } = App.useApp();

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallets/');
      setWallets(response.data);
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar carteiras',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleEdit = (id) => {
    router.push(`/admin/wallets/edit?id=${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/wallets/${id}`);
      notification.success({
        message: 'Carteira excluída com sucesso',
      });
      fetchWallets();
    } catch (error) {
      notification.error({
        message: 'Erro ao excluir carteira',
        description: error.message,
      });
    }
  };

  const getCategoryLabel = (cat) => {
    const map = {
        educacao: 'Educação',
        saude: 'Saúde',
        assistencia_social: 'Assistência Social',
        infraestrutura: 'Infraestrutura',
        livre: 'Livre'
    };
    return map[cat] || cat;
  };

  return (
    <>
      <Main>
        <div style={{ marginBottom: 25, display: 'flex', justifyContent: 'flex-end' }}>
             <Button key="1" type="primary" size="large" onClick={() => router.push('/admin/wallets/add')}>
                <FeatherIcon icon="plus" size={14} /> Nova Carteira
            </Button>
        </div>

        {loading ? (
            <Skeleton active />
        ) : wallets.length === 0 ? (
            <Empty description="Nenhuma carteira cadastrada" />
        ) : (
            <Row gutter={25}>
            {wallets.map((wallet) => (
                <Col key={wallet.id} xxl={6} xl={8} md={12} xs={24}>
                    <Cards headless>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{wallet.name}</h3>
                                <span style={{ color: '#888', fontSize: 12 }}>{getCategoryLabel(wallet.category)}</span>
                            </div>
                            {wallet.is_restricted ? (
                                <Tag color="red">Restrito</Tag>
                            ) : (
                                <Tag color="green">Livre</Tag>
                            )}
                        </div>
                        
                        <div style={{ marginBottom: 20 }}>
                            <Statistic 
                                title="Saldo Disponível" 
                                value={wallet.balance} 
                                precision={2} 
                                prefix="R$" 
                                valueStyle={{ color: wallet.balance < 0 ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}
                            />
                        </div>

                        {wallet.description && (
                            <p style={{ color: '#666', marginBottom: 20, minHeight: 40 }}>
                                {wallet.description.length > 60 ? `${wallet.description.substring(0, 60)}...` : wallet.description}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                            <Button block type="primary" onClick={() => router.push(`/admin/wallets/${wallet.id}`)}>
                                Ver Dashboard
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<FeatherIcon icon="edit" size={14} />} 
                                onClick={() => handleEdit(wallet.id)}
                            />
                            <Popconfirm
                                title="Tem certeza que deseja excluir esta carteira?"
                                onConfirm={() => handleDelete(wallet.id)}
                                okText="Sim"
                                cancelText="Não"
                            >
                                <Button 
                                    type="primary" 
                                    danger 
                                    icon={<FeatherIcon icon="trash-2" size={14} />} 
                                />
                            </Popconfirm>
                        </div>
                    </Cards>
                </Col>
            ))}
            </Row>
        )}
      </Main>
    </>
  );
}

export default Wallets;
