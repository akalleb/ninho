'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../../../config/api/axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

function Filters({ onFilterChange }) {
  const [form] = Form.useForm();
  const [professionals, setProfessionals] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    // Carregar Profissionais
    api.get('/professionals/basic')
      .then(res => setProfessionals(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar profissionais", err));

    // Carregar Carteiras
    api.get('/wallets/')
      .then(res => setWallets(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erro ao carregar carteiras", err));
  }, []);

  const onFinish = (values) => {
    // Format dates if present
    const filters = { ...values };
    if (values.dateRange) {
        filters.start_date = values.dateRange[0].format('YYYY-MM-DD');
        filters.end_date = values.dateRange[1].format('YYYY-MM-DD');
        delete filters.dateRange;
    }
    onFilterChange(filters);
  };

  return (
    <Form form={form} name="report_filters" layout="vertical" onFinish={onFinish}>
      <Row gutter={25} align="bottom">
        <Col xs={24} md={6}>
          <Form.Item name="dateRange" label="Período">
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Data inicial', 'Data final']}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="professional_id" label="Profissional">
             <Select placeholder="Todos" allowClear showSearch optionFilterProp="children">
                {professionals.map(p => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
             </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="wallet_id" label="Carteira (Recurso)">
             <Select placeholder="Todas" allowClear showSearch optionFilterProp="children">
                {wallets.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                ))}
             </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Filtrar
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default Filters;
