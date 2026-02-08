import React, { useState, useEffect } from 'react';
import { Badge, Spin, Tag, Modal, List, Typography } from 'antd';
import FeatherIcon from 'feather-icons-react';
import PropTypes from 'prop-types';
import { NextLink } from '../../utilities/NextLink';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSelector, shallowEqual } from 'react-redux';
import { AtbdTopDropdwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import api from '../../../config/api/axios';

const { Paragraph, Text } = Typography;

function NotificationBox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { id: professionalId, role } = useSelector(state => state.auth.login || {});
  
  const { rtl } = useSelector(
    state => ({
      rtl: state.ChangeLayoutMode.rtlData,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (professionalId) {
      try {
        const stored = localStorage.getItem(`read_notifications_${professionalId}`);
        if (stored) {
          setReadIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load read notifications", e);
      }
    }
  }, [professionalId]);
  
  const fetchNotifications = async () => {
    if (!professionalId) return;
    setLoading(true);
    try {
        const target = role === 'admin' ? 'admin' : 'health';
        const response = await api.get(`/notifications/?active_only=true&target=${target}&professional_id=${professionalId}`);
        setNotifications(response.data);
    } catch (error) {
        console.error("Failed to fetch notifications", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
  }, [professionalId, role]);

  const markAsRead = (note) => {
      if (!readIds.includes(note.id)) {
          const newReadIds = [...readIds, note.id];
          setReadIds(newReadIds);
          localStorage.setItem(`read_notifications_${professionalId}`, JSON.stringify(newReadIds));
      }
      setSelectedNotification(note);
      setPopoverOpen(false); // Fecha o popover ao abrir o modal
  };

  const handleViewAll = (e) => {
      e.preventDefault();
      setViewAllOpen(true);
      setPopoverOpen(false); // Fecha o popover ao abrir o modal
  };

  const handlePopoverChange = (visible) => {
      setPopoverOpen(visible);
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  function renderThumb({ style, ...props }) {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  }

  const renderTrackVertical = () => {
    const thumbStyle = {
      position: 'absolute',
      width: '6px',
      transition: 'opacity 200ms ease 0s',
      opacity: 0,
      [rtl ? 'left' : 'right']: '2px',
      bottom: '2px',
      top: '2px',
      borderRadius: '3px',
    };
    return <div className="hello" style={thumbStyle} />;
  };

  function renderView({ style, ...props }) {
    const customStyle = {
      marginRight: rtl && 'auto',
    };
    return <div {...props} style={{ ...style, ...customStyle }} />;
  }

  renderThumb.propTypes = {
    style: PropTypes.shape(PropTypes.object),
  };

  renderView.propTypes = {
    style: PropTypes.shape(PropTypes.object),
  };

  const content = (
    <AtbdTopDropdwon className="atbd-top-dropdwon">
      <Heading as="h5" className="atbd-top-dropdwon__title">
        <span className="title-text">Notificações</span>
        <Badge className="badge-success" count={unreadCount} />
      </Heading>
      <Scrollbars
        autoHeight
        autoHide
        renderThumbVertical={renderThumb}
        renderView={renderView}
        renderTrackVertical={renderTrackVertical}
      >
        {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>
        ) : (
            <ul className="atbd-top-dropdwon__nav notification-list">
            {notifications.length > 0 ? notifications.map((note) => {
                const isRead = readIds.includes(note.id);
                let icon = 'info';
                let bgClass = 'bg-primary';
                if (note.type === 'warning') { icon = 'alert-triangle'; bgClass = 'bg-warning'; }
                if (note.type === 'error') { icon = 'alert-circle'; bgClass = 'bg-danger'; }
                if (note.type === 'success') { icon = 'check-circle'; bgClass = 'bg-success'; }

                return (
                    <li key={note.id}>
                        <a href="#" onClick={(e) => { e.preventDefault(); markAsRead(note); }}>
                        <div className="atbd-top-dropdwon__content notifications">
                            <div className={`notification-icon ${bgClass}`}>
                                <FeatherIcon icon={icon} />
                            </div>
                            <div className="notification-content d-flex">
                            <div className="notification-text">
                                <Heading as="h5">
                                    <span style={{ fontWeight: isRead ? 'normal' : 'bold' }}>{note.title}</span>
                                </Heading>
                                <p style={{ color: isRead ? '#999' : 'inherit' }}>{note.message}</p>
                            </div>
                            <div className="notification-status">
                                {!isRead && <Badge dot />}
                            </div>
                            </div>
                        </div>
                        </a>
                    </li>
                );
            }) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Nenhuma notificação nova</div>
            )}
            </ul>
        )}
      </Scrollbars>
      <a className="btn-seeAll" href="#" onClick={handleViewAll}>
        Ver todas as notificações
      </a>
    </AtbdTopDropdwon>
  );

  return (
    <div className="notification">
      <Popover 
        placement="bottomLeft" 
        content={content} 
        action="click"
        open={popoverOpen}
        onOpenChange={handlePopoverChange}
      >
        <Badge count={unreadCount} dot offset={[-8, -5]}>
          <span className="head-example" style={{ cursor: 'pointer', display: 'inline-block' }}>
            <FeatherIcon icon="bell" size={20} />
          </span>
        </Badge>
      </Popover>

      {/* Modal de Detalhes da Notificação */}
      <Modal
        title={selectedNotification?.title}
        open={!!selectedNotification}
        onCancel={() => setSelectedNotification(null)}
        footer={null}
        zIndex={99999}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Tag color={selectedNotification?.type === 'warning' ? 'orange' : selectedNotification?.type === 'error' ? 'red' : 'blue'}>
                {selectedNotification?.type?.toUpperCase() || 'INFO'}
            </Tag>
            <Paragraph>
                {selectedNotification?.message}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
                Recebido em: {selectedNotification?.created_at ? new Date(selectedNotification.created_at).toLocaleString() : ''}
            </Text>
        </div>
      </Modal>

      {/* Modal Ver Todas */}
      <Modal
        title="Todas as Notificações"
        open={viewAllOpen}
        onCancel={() => setViewAllOpen(false)}
        footer={null}
        width={600}
        zIndex={99999}
      >
        <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => {
                const isRead = readIds.includes(item.id);
                return (
                    <List.Item 
                        style={{ cursor: 'pointer', background: isRead ? 'transparent' : '#f9f9f9' }}
                        onClick={() => { markAsRead(item); }}
                    >
                        <List.Item.Meta
                            avatar={
                                <Tag color={item.type === 'warning' ? 'orange' : item.type === 'error' ? 'red' : 'blue'}>
                                    {item.type?.toUpperCase()}
                                </Tag>
                            }
                            title={<Text strong={!isRead}>{item.title}</Text>}
                            description={
                                <div>
                                    <div>{item.message}</div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {new Date(item.created_at).toLocaleString()}
                                    </Text>
                                </div>
                            }
                        />
                        {!isRead && <Badge dot status="processing" />}
                    </List.Item>
                );
            }}
        />
      </Modal>
    </div>
  );
}

export default NotificationBox;
