'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Alert, Select, Spin, App } from 'antd';
import { FileTextOutlined, FileExcelOutlined, WarningOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import api from '../../../config/api/axios';
import fileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const { Option } = Select;

function SusExport({ filters }) {
    const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [validationData, setValidationData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const { message } = App.useApp();
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        api.get('/reports/validate/sus')
            .then(res => {
                const list = res?.data && Array.isArray(res.data) ? res.data : [];
                const data = list.map((item, index) => ({
                    key: index,
                    ...item
                }));
                setValidationData(data);
            })
            .catch(err => {
                console.error("Erro na validação SUS", err);
                setValidationData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleFix = (record) => {
        if (!record || !record.type || !record.id) {
            return;
        }

        if (record.type === 'professional') {
            router.push(`/admin/dashboard/users/add-user?id=${record.id}`);
            return;
        }

        if (record.type === 'child') {
            router.push(`/admin/children/edit?id=${record.id}`);
            return;
        }
    };

    const validationColumns = [
        { title: 'Tipo', dataIndex: 'type', key: 'type' },
        { title: 'Nome', dataIndex: 'name', key: 'name' },
        { 
            title: 'Campos Faltantes', 
            dataIndex: 'missing_fields', 
            key: 'missing_fields', 
            render: tags => (
                <span style={{ color: '#FF4D4F' }}>
                    {Array.isArray(tags) ? tags.join(', ') : ''}
                </span>
            ) 
        },
        { 
            title: 'Ação', 
            key: 'action', 
            render: (_, record) => (
                <Button size="small" type="link" onClick={() => handleFix(record)}>
                    Corrigir
                </Button>
            ),
        }
    ];

    const handleExport = (type) => {
        setExporting(true);
        api.get('/reports/export/bpa', {
            params: {
                type,
                month: selectedMonth,
                year: selectedYear
            }
        }).then(res => {
            const blob = new Blob([res.data.content], { type: "text/plain;charset=utf-8" });
            fileSaver.saveAs(blob, res.data.filename);
            message.success(`Arquivo ${type} gerado com sucesso!`);
        }).catch(err => {
            console.error("Erro na exportação", err);
            message.error("Erro ao gerar arquivo de exportação.");
        }).finally(() => {
            setExporting(false);
        });
    };

    const handleExportExcel = () => {
        try {
            setExporting(true);
            if (!validationData.length) {
                message.info('Não há dados de validação para exportar.');
                return;
            }

            const rows = validationData.map((item) => ({
                Tipo: item.type || '',
                Nome: item.name || '',
                CamposFaltantes: Array.isArray(item.missing_fields)
                    ? item.missing_fields.join(', ')
                    : '',
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = { Sheets: { Dados: ws }, SheetNames: ['Dados'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob(
                [excelBuffer],
                {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                },
            );

            const monthStr = String(selectedMonth).padStart(2, '0');
            const filename = `validacao_sus_${selectedYear}_${monthStr}.xlsx`;
            fileSaver.saveAs(blob, filename);
            message.success('Planilha Excel gerada com sucesso!');
        } catch (err) {
            console.error('Erro ao exportar Excel SUS', err);
            message.error('Erro ao gerar planilha Excel.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Row gutter={25}>
            <Col xs={24} lg={16}>
                <Card title="Geração de Arquivos BPA (SIA/SUS)" variant="borderless">
                    <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                         <span>Competência:</span>
                         <Select defaultValue={selectedMonth} style={{ width: 120 }} onChange={setSelectedMonth}>
                             {Array.from({length: 12}, (_, i) => (
                                 <Option key={i+1} value={i+1}>{moment().month(i).format('MMMM')}</Option>
                             ))}
                         </Select>
                         <Select defaultValue={selectedYear} style={{ width: 100 }} onChange={setSelectedYear}>
                             <Option value={2024}>2024</Option>
                             <Option value={2025}>2025</Option>
                             <Option value={2026}>2026</Option>
                         </Select>
                    </div>

                    <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                        <Button 
                            type="primary" 
                            icon={<FileTextOutlined />} 
                            size="large" 
                            onClick={() => handleExport('BPA-I')}
                            loading={exporting}
                        >
                            Gerar BPA-I (Individualizado)
                        </Button>
                        <Button 
                            type="default" 
                            icon={<FileTextOutlined />} 
                            size="large" 
                            onClick={() => handleExport('BPA-C')}
                            loading={exporting}
                        >
                            Gerar BPA-C (Consolidado)
                        </Button>
                        <Button
                            icon={<FileExcelOutlined />}
                            size="large"
                            onClick={handleExportExcel}
                            loading={exporting}
                        >
                            Exportar Excel
                        </Button>
                    </div>
                    
                    <Alert
                        message="Atenção ao Cronograma"
                        description="O envio do BPA deve ser realizado até o 5º dia útil do mês subsequente para garantir o faturamento."
                        type="info"
                        showIcon
                        style={{ marginTop: 20 }}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                <Card 
                    title={
                        <span>
                            <WarningOutlined style={{ color: '#FA8B0C', marginRight: 8 }} />
                            Validação de Dados SUS
                        </span>
                    } 
                    variant="borderless"
                >
                    {loading ? <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div> : (
                        <>
                            <Alert
                                message="Pendências Encontradas"
                                description={`${validationData.length} registros precisam de correção antes da exportação.`}
                                type={validationData.length > 0 ? "warning" : "success"}
                                showIcon
                                style={{ marginBottom: 15 }}
                            />
                            <Table 
                                dataSource={validationData} 
                                columns={validationColumns} 
                                pagination={false} 
                                size="small"
                                scroll={{ y: 240 }}
                            />
                        </>
                    )}
                </Card>
            </Col>
        </Row>
    );
}

export default SusExport;
