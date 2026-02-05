/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { OrderSummary } from '../Style';
import { Cards } from '../../../components/cards/frame/cards-frame';
import Heading from '../../../components/heading/heading';
import { Button } from '../../../components/buttons/buttons';
import { cartGetData } from '../../../redux/cart/actionCreator';
import subtractionImg from '../../../static/img/Subtraction1.png';

function Ordersummary({ subtotal, isExact, path }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { rtl } = useSelector(state => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
    };
  });

  const [form] = Form.useForm();
  const [state, setState] = useState({
    coupon: 0,
    promo: 0,
    current: 0,
  });

  useEffect(() => {
    if (cartGetData) {
      dispatch(cartGetData());
    }
  }, [dispatch]);

  const submitPromo = values => {
    setState({ ...state, promo: values });
  };

  const { Option } = Select;

  const onSubmit = () => {
    // Use textContent instead of innerHTML for security
    // This is safer as it only reads text content, not HTML
    document.querySelectorAll('button span').forEach(item => {
      if (item.textContent?.trim() === 'Done') {
        item.click();
      }
    });
  };

  return (
    <Cards
      bodyStyle={{
        backgroundColor: '#F8F9FB',
        borderRadius: '20px',
      }}
      headless
    >
      <OrderSummary>
        <Heading className="summary-table-title" as="h4">
          Order Summary
        </Heading>
        <Cards
          bodyStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
          }}
          headless
        >
          <div className="order-summary-inner">
            <ul className="summary-list">
              <li>
                <span className="summary-list-title">Subtotal :</span>
                <span className="summary-list-text">{`$${subtotal}`}</span>
              </li>
              <li>
                <span className="summary-list-title">Discount :</span>
                <span className="summary-list-text">{`$${-20}`}</span>
              </li>
              <li>
                <span className="summary-list-title">Shipping Charge :</span>
                <span className="summary-list-text">{`$${30}`}</span>
              </li>
            </ul>
            <Form layout="vertical" form={form} name="promo" onFinish={submitPromo}>
              <Form.Item name="couponType" initialValue="" label="">
                <Select className="w-100">
                  <Option value="">
                    <img src={subtractionImg} alt="" /> Select Coupon
                  </Option>
                  <Option value="one">
                    <img src={subtractionImg} alt="" /> Coupon one
                  </Option>
                  <Option value="tow">
                    <img src={subtractionImg} alt="" /> Coupon tow
                  </Option>
                </Select>
              </Form.Item>
              <div className="promo-apply-form">
                <Form.Item name="promoCode" label="Promo Code">
                  <Input placeholder="Promo Code" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" size="default" type="success" outlined>
                    Apply
                  </Button>
                </Form.Item>
              </div>
            </Form>
            <Heading className="summary-total" as="h4">
              <span className="summary-total-label">Total : </span>
              <span className="summary-total-amount">{`$${subtotal + 30 - 20}`}</span>
            </Heading>
            {isExact && (
              <Button 
                className="btn-proceed" 
                type="secondary" 
                size="large"
                onClick={() => router.push(`${path}/checkout`)}
              >
                Proceed To Checkout
                <FeatherIcon icon={!rtl ? 'arrow-right' : 'arrow-left'} size={14} />
              </Button>
            )}
            {state.current === 3 && (
              <Button onClick={onSubmit} className="btn-proceed" type="secondary" size="large">
                Place Order
              </Button>
            )}
          </div>
        </Cards>
      </OrderSummary>
    </Cards>
  );
}

export default Ordersummary;
