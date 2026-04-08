import React, { useState } from 'react';
import { Row, Col, Form, Input, DatePicker, Radio } from 'antd';
import { NextLink } from '../../../components/utilities/NextLink';
import { BasicFormWrapper } from '../../styled';
import { Button } from '../../../components/buttons/buttons';
import Heading from '../../../components/heading/heading';

const dateFormat = 'MM/DD/YYYY';

function Work() {
  const [form] = Form.useForm();
  const [state, setState] = useState({
    values: '',
  });
  const handleSubmit = (values) => {
    setState({ ...state, values });
  };

  return (
    <Row justify="center">
      <Col xl={10} md={16} xs={24}>
        <div className="user-work-form">
          <BasicFormWrapper>
            <Form layout="vertical" className="w-100" form={form} name="work" onFinish={handleSubmit}>
              <Heading className="form-title" as="h4">
                Work Information
              </Heading>

              <Form.Item name="company" label="Company Name">
                <Input placeholder="Company Name" />
              </Form.Item>

              <Form.Item name="department" label="Department">
                <Input placeholder="Department name" />
              </Form.Item>

              <Form.Item name="designation" label="Designation">
                <Input placeholder="Designation" />
              </Form.Item>

              <Form.Item name="hiringDate" rules={[{ type: 'object', whitespace: true }]} label="Hiring Date">
                <DatePicker format={dateFormat} className="w-100" />
              </Form.Item>

              <Form.Item name="status" initialValue="active" label="Status">
                <Radio.Group>
                  <Radio value="active">Active</Radio>
                  <Radio value="deactivated">Deactivated</Radio>
                  <Radio value="blocked">Blocked</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <div className="add-user-bottom text-right">
                  <Button
                    className="ant-btn ant-btn-light"
                    type="default"
                    onClick={() => {
                      return form.resetFields();
                    }}
                  >
                    Reset
                  </Button>
                  <Button htmlType="submit" type="primary">
                    <NextLink to="/admin/users/add-user/social">Next</NextLink>
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </BasicFormWrapper>
        </div>
      </Col>
    </Row>
  );
}

export default Work;
