import React from 'react';
import { Form, Input, Button } from 'antd';
import { HorizontalFormStyleWrap } from './Style';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { BasicFormWrapper } from '../../styled';

function HorizontalForm() {
  return (
    <BasicFormWrapper>
      <HorizontalFormStyleWrap>
        <Cards title="Horizontal Form">
          <Form 
            name="horizontal-form" 
            layout="horizontal"
            labelCol={{ span: 8 }} 
            wrapperCol={{ span: 16 }}
          >
            <Form.Item label="Name" name="name" initialValue="Duran Clayton">
              <Input placeholder="Enter Name" />
            </Form.Item>
            <Form.Item label="Email Address" name="email" initialValue="username@email.com">
              <Input placeholder="Enter Email" />
            </Form.Item>
            <Form.Item label="Password" name="password" initialValue="1234567">
              <Input.Password placeholder="Enter Password" />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
              <div className="sDash_form-action">
                <Button className="btn-signin" htmlType="button" type="light" size="large">
                  Cancel
                </Button>
                <Button className="btn-signin" htmlType="submit" type="primary" size="large">
                  Save
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Cards>
      </HorizontalFormStyleWrap>
    </BasicFormWrapper>
  );
}

export { HorizontalForm };
