import React, { useState } from 'react';
import { Form, Input } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Button } from '../../../components/buttons/buttons';
import propTypes from 'prop-types';

/**
 * Component for adding new columns to the Kanban board
 */
const ColumnAdder = ({ onAddColumn, onCancel }) => {
  const [form] = Form.useForm();
  const [columnName, setColumnName] = useState('');

  const handleSubmit = () => {
    if (columnName.trim()) {
      onAddColumn(columnName.trim());
      setColumnName('');
      form.resetFields();
      onCancel();
    }
  };

  const handleCancel = () => {
    setColumnName('');
    form.resetFields();
    onCancel();
  };

  return (
    <div className="btn-addColumn add-column-on">
      <div className="btn-addColumn-inner">
        <Form className="addColumn-form" name="columnAdd" form={form} onFinish={handleSubmit}>
          <div className="btn-addColumn-form">
            <Input
              value={columnName}
              className="sDash-add-column-input"
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter Column Title"
              autoFocus
            />
            <div className="sDash_add-column-action">
              <Button className="add-column" htmlType="submit" size="small" type="primary">
                Add
              </Button>
              <span onClick={handleCancel} className="cursor-pointer">
                <FeatherIcon icon="x" size={18} />
              </span>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

ColumnAdder.propTypes = {
  onAddColumn: propTypes.func.isRequired,
  onCancel: propTypes.func.isRequired,
};

export default ColumnAdder;

