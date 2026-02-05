import React, { useEffect } from 'react';
import { Row, Col, Form, Input, Select, Radio, Table } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { WizardWrapper, ProductTable, OrderSummary } from '../Style';
import { Steps } from '../../../../components/steps/steps';
import Heading from '../../../../components/heading/heading';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { BasicFormWrapper } from '../../../styled';
import { cartGetData } from '../../../../redux/cart/actionCreator';
import { useWizardSteps } from '../hooks/useWizardSteps';
import { useCartOperations } from '../hooks/useCartOperations';
import { useCartTableData } from '../hooks/useCartTableData';
import { getImageUrl } from '../../../../utility/getImageUrl';

const { Option } = Select;

function WizardsOne() {
  const dispatch = useDispatch();
  const { cartData, rtl } = useSelector((state) => {
    return {
      cartData: state.cart.data,
      isLoading: state.cart.loading,
      rtl: state.ChangeLayoutMode.rtlData,
    };
  });
  const [form] = Form.useForm();

  // Custom hooks for separated concerns
  const { status, isFinished, current, validation, goNext, goPrev, finish, resetValidation } =
    useWizardSteps(1);

  const cartOperations = useCartOperations(cartData);
  const { dataSource, subtotal, columns } = useCartTableData(cartData, cartOperations);

  useEffect(() => {
    if (cartGetData) {
      dispatch(cartGetData());
    }
  }, [dispatch]);

  // Wizard navigation handlers
  const handleNext = () => {
    goNext(() => form.validateFields());
  };

  const handlePrev = () => {
    goPrev();
  };

  const handleDone = () => {
    finish(() => window.confirm('Are sure to submit order?'));
  };

  const month = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  return (
    <WizardWrapper>
      <Steps
        isswitch
        current={0}
        status={status}
        validation={validation}
        validationStatus={resetValidation}
        steps={[
          {
            title: 'Create Account',
            content: (
              <BasicFormWrapper className="basic-form-inner">
                <div className="atbd-form-checkout">
                  <Row justify="center">
                    <Col sm={22} xs={24}>
                      <div className="create-account-form">
                        <Heading as="h4">1. Please Create Your Account</Heading>
                        <Form layout="vertical" form={form} name="account">
                          <Form.Item
                            name="username"
                            label="Username"
                            rules={[{ required: true, message: 'Username required!' }]}
                          >
                            <Input placeholder="Username" />
                          </Form.Item>
                          <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[{ required: true, message: 'Email required!', type: 'email' }]}
                          >
                            <Input placeholder="name@gmail.com" />
                          </Form.Item>
                          <Form.Item
                            name="password"
                            rules={[
                              {
                                min: 6,
                                message: 'Enter a valid password. Min 6 characters long.',
                              },
                            ]}
                            label="Password"
                          >
                            <Input.Password placeholder="Password" />
                          </Form.Item>
                          <span className="input-message">Enter a valid password. Min 6 characters long</span>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </div>
              </BasicFormWrapper>
            ),
          },
          {
            title: 'Shipping Address',
            content: (
              <BasicFormWrapper className="basic-form-inner">
                <div className="atbd-form-checkout">
                  <Row justify="center">
                    <Col sm={22} xs={24}>
                      <div className="shipping-form">
                        <Heading as="h4">2. Please Fill in Your Shipping Address</Heading>
                        <Form layout="vertical" form={form} name="address">
                          <Form.Item name="name" label="Contact Name">
                            <Input placeholder="Ibn adam" />
                          </Form.Item>
                          <Form.Item
                            name="company"
                            label={
                              <span>
                                Company Name <span>(Optional)</span>
                              </span>
                            }
                          >
                            <Input placeholder="adam" />
                          </Form.Item>
                          <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[{ required: true, message: 'Phone number required!' }]}
                          >
                            <Input placeholder="+880" />
                          </Form.Item>
                          <Form.Item name="country" initialValue="" label="Country/Region">
                            <Select className="w-100">
                              <Option value="">Please Select</Option>
                              <Option value="bangladesh">Bangladesh</Option>
                              <Option value="india">India</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="street"
                            label="Street Address"
                            rules={[{ required: true, message: 'Street Address required!' }]}
                          >
                            <Input placeholder="House Number and Street Name" />
                          </Form.Item>
                          <Form.Item name="street2" label="">
                            <Input placeholder="Apartment, Suite, Unit etc." />
                          </Form.Item>
                          <Form.Item name="city" label="City">
                            <Input placeholder="Enter City" />
                          </Form.Item>
                          <Form.Item name="zip" label="Zip/Postal Code">
                            <Input placeholder="Enter Zip" />
                          </Form.Item>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </div>
              </BasicFormWrapper>
            ),
          },
          {
            title: 'Payment Method',
            content: (
              <BasicFormWrapper className="basic-form-inner">
                <div className="atbd-form-checkout">
                  <Row justify="center">
                    <Col sm={22} xs={24}>
                      <div className="payment-method-form">
                        <Heading as="h4">3. Please Please Select Your Payment Method</Heading>
                        <div className="shipping-selection">
                          <Radio.Group className="w-100">
                            <div className="shipping-selection__card">
                              <Radio className="w-100" value="card">
                                <Cards
                                  headless
                                  bodyStyle={{
                                    backgroundColor: '#F8F9FB',
                                    borderRadius: '20px',
                                    border: '1px solid #F1F2F6',
                                  }}
                                >
                                  <div className="supported-card d-flex">
                                    <span>Credit/Debit Card</span>
                                    <div className="supported-card_logos">
                                      <img
                                        className="w-50px"
                                        src={require('../../../../static/img/cards-logo/ms.png')}
                                        alt=""
                                      />
                                      <img
                                        className="w-50px"
                                        src={require('../../../../static/img/cards-logo/american-express.png')}
                                        alt=""
                                      />
                                      <img
                                        className="w-50px"
                                        src={require('../../../../static/img/cards-logo/visa.png')}
                                        alt=""
                                      />
                                    </div>
                                  </div>
                                  <Cards headless className="mb-0">
                                    <Form layout="vertical" form={form} name="info">
                                      <Form.Item
                                        name="number"
                                        label="Card Number"
                                        rules={[{ required: true, message: 'Card number required!' }]}
                                      >
                                        <Input placeholder="6547-8702-6987-2527" />
                                      </Form.Item>
                                      <Form.Item name="name" label="Name on Card">
                                        <Input placeholder="Full name" />
                                      </Form.Item>
                                      <Form.Item name="month" initialValue="" label="Expiration Date">
                                        <Select className="w-100">
                                          <Option value="">MM</Option>
                                          {month.map((value) => (
                                            <Option key={value} value={value}>
                                              {value}
                                            </Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                      <Form.Item name="year" initialValue="">
                                        <Select className="w-100">
                                          <Option value="">YY</Option>
                                          <Option value={new Date().getFullYear()}>{new Date().getFullYear()}</Option>
                                          {month.map((value) => (
                                            <Option
                                              key={value}
                                              value={parseInt(new Date().getFullYear(), 10) + parseInt(value, 10)}
                                            >
                                              {parseInt(new Date().getFullYear(), 10) + parseInt(value, 10)}
                                            </Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                      <Form.Item name="cvv" label="CVV">
                                        <div className="cvv-wrap">
                                          <Input style={{ width: '60%' }} placeholder="XXX" />
                                          <span className="input-leftText cursor-pointer">
                                            What is this?
                                          </span>
                                        </div>
                                      </Form.Item>
                                    </Form>
                                  </Cards>
                                </Cards>
                              </Radio>
                            </div>
                            <div className="shipping-selection__paypal">
                              <Radio value="payPal" className="w-100">
                                Pay With PayPal
                                <img src={getImageUrl('static/img/PayPalLogo.png')} alt="paypal" />
                              </Radio>
                            </div>
                            <div className="shipping-selection__cash">
                              <Radio value="cash" className="w-100">
                                Cash on delivery
                              </Radio>
                            </div>
                          </Radio.Group>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </BasicFormWrapper>
            ),
          },
          {
            title: 'Review Order',
            content:
              status !== 'finish' ? (
                <BasicFormWrapper className="w-100">
                  <div className="atbd-review-order w-100">
                    <Heading as="h4">4. Review and confirm Order</Heading>
                    <Cards bodyStyle={{ backgroundColor: '#F8F9FB', borderRadius: 10 }} headless>
                      <div className="atbd-review-order__single">
                        <Cards headless>
                          <div className="atbd-review-order__shippingTitle">
                            <Heading as="h5">
                              Shipping Information
                              <span className="cursor-pointer">
                                <FeatherIcon icon="edit" />
                                Edit
                              </span>
                            </Heading>
                          </div>
                          <article className="atbd-review-order__shippingInfo">
                            <Radio.Group className="w-100">
                              <Radio value="ms" style={{ width: '100%' }}>
                                <div className="shipping-info-text">
                                  <Heading as="h6">Ibn Adam</Heading>
                                  <Heading as="h6">Phone: +61412345678</Heading>
                                  <p>
                                    795 Folsom Ave, Suite 600 <br />
                                    San Francisco, CA 94107 <br />
                                    United States
                                  </p>
                                </div>
                              </Radio>
                            </Radio.Group>
                            <span className="btn-addNew cursor-pointer">
                              + Add New Address
                            </span>
                          </article>
                        </Cards>
                      </div>
                      <div className="atbd-review-order__single">
                        <Cards headless>
                          <div>
                            <Heading as="h5">Payment Method</Heading>
                          </div>
                          <Radio.Group className="w-100">
                            <Radio value="ms" style={{ width: '100%' }}>
                              <div className="method-info">
                                <img src={require('../../../../static/img/ms.svg')} alt="" />
                                **** **** **** 2597
                              </div>
                            </Radio>
                          </Radio.Group>
                          <span className="btn-addCard cursor-pointer">
                            + Add New Card
                          </span>
                        </Cards>
                      </div>

                      <div className="atbd-review-order__single">
                        <Cards headless>
                          <>
                            <ProductTable>
                              <div className="table-cart table-responsive">
                                <Table pagination={false} dataSource={dataSource} columns={columns} />
                              </div>
                            </ProductTable>

                            <Row justify="end">
                              <Col xxl={8} xl={5} md={9} sm={14} xs={24} offset={!rtl ? 10 : 0}>
                                <OrderSummary>
                                  <div className="invoice-summary-inner">
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
                                    <Heading className="summary-total" as="h4">
                                      <span className="summary-total-label">Total : </span>
                                      <span className="summary-total-amount">{`$${subtotal + 30 - 20}`}</span>
                                    </Heading>
                                  </div>
                                </OrderSummary>
                              </Col>
                            </Row>
                          </>
                        </Cards>
                      </div>
                    </Cards>
                  </div>
                </BasicFormWrapper>
              ) : (
                <Row justify="center" style={{ width: '100%' }}>
                  <Col xl={22} xs={24}>
                    <div className="checkout-successful">
                      <Cards
                        headless
                        bodyStyle={{
                          backgroundColor: '#F8F9FB',
                          borderRadius: '20px',
                        }}
                      >
                        <Cards headless>
                          <span className="icon-success">
                            <FeatherIcon icon="check" />
                          </span>
                          <Heading as="h3">Payment Successful</Heading>
                          <p>Thank you! We have received your Payment</p>
                        </Cards>
                      </Cards>
                    </div>
                  </Col>
                </Row>
              ),
          },
        ]}
        onNext={handleNext}
        onPrev={handlePrev}
        onDone={handleDone}
        isfinished={isFinished}
      />
    </WizardWrapper>
  );
}

export default WizardsOne;
