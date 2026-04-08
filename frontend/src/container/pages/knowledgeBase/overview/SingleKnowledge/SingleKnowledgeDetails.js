import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import FontAwesome from 'react-fontawesome';
import { Collapse, Row, Col, Form, Input } from 'antd';
import { Button } from '../../../../../components/buttons/buttons';
import { KnowledgeDetailsWrap } from '../../style';
import { getImageUrl } from '../../../../../utility/getImageUrl';

const { TextArea } = Input;
function SingleKnowledgeDetails() {
  const [state, setstate] = useState({
    key: 0,
  });
  const callback = (key) => {
    setstate({ ...state, key });
  };
  return (
    <KnowledgeDetailsWrap>
      <div className="knowledge-details">
        <h2 className="knowledge-details__title">Switch between accounts</h2>
        <div className="knowledge-details__single--block">
          <h4>
            <span className="cursor-pointer">Configuration</span>
          </h4>
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
            dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
            clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet….
          </p>
          <span className="btn-more cursor-pointer">
            Read More
          </span>
        </div>
        <div className="knowledge-details__single--block">
          <h4>
            <span className="cursor-pointer">Research and experiments</span>
          </h4>
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
            dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
            clita kasd gubergren, no sea takimata sanctus.
          </p>
          <div className="knowledge-details-img">
            <img src={getImageUrl('static/img/knowledgebase/wp-research.png')} alt="StrikingDash" />
          </div>
        </div>
        <div className="knowledge-details__single--block">
          <div className="knowledge-details-collapse">
            <Collapse
              defaultActiveKey={['1']}
              onChange={callback}
              items={[
                {
                  key: '1',
                  label: (
                    <div className="knowledge-details-collapse__title">
                      <span className="cursor-pointer">
                        <h4>Measuring elevation</h4>
                      </span>
                    </div>
                  ),
                  children: (
                    <div className="knowledge-details-collapse__text">
                      <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                        labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                        et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet….
                      </p>
                      <span className="btn-more cursor-pointer">
                        Read More
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className="knowledge-details__single--block">
          <div className="knowledge-details-collapse">
            <Collapse
              defaultActiveKey={['1']}
              onChange={callback}
              items={[
                {
                  key: '1',
                  label: (
                    <div className="knowledge-details-collapse__title">
                      <span className="cursor-pointer">
                        <h4>Measuring elevation</h4>
                      </span>
                    </div>
                  ),
                  children: (
                    <div className="knowledge-details-collapse__text">
                      <p>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                        labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
                        et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet….
                      </p>
                      <span className="btn-more cursor-pointer">
                        Read More
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <span className="knowledge-details-date-meta">
          <span className="title">Last updated:</span>
          <span className="date">June 7, 2019</span>
        </span>
        <div className="knowledge-details-cta">
          <h4 className="knowledge-details-cta__text">Was this article helpful?</h4>
          <div className="knowledge-details-cta__actions">
            <Button outlined type="success">
              <FeatherIcon size={14} icon="smile" />
              Yes
            </Button>
            <Button outlined type="warning">
              <FeatherIcon size={14} icon="frown" />
              No
            </Button>
          </div>
        </div>
        <div className="knowledge-details__bottom">
          <div className="knowledge-details__bottom--left">
            <span>Still need help?</span>
            <span className="cursor-pointer">Submit a Request</span>
          </div>
          <div className="knowledge-details__bottom--right">
            <ul className="soical-share">
              <li>
                <span>Share this article:</span>
              </li>
              <li>
                <span className="cursor-pointer">
                  <FontAwesome name="facebook" size="2x" />
                </span>
              </li>
              <li>
                <span className="cursor-pointer">
                  <FontAwesome name="twitter" size="2x" />
                </span>
              </li>
              <li>
                <span className="cursor-pointer">
                  <FontAwesome name="pinterest" size="2x" />
                </span>
              </li>
              <li>
                <span className="cursor-pointer">
                  <FontAwesome name="link" size="2x" />
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="knowledge-details-pagination">
          <ul>
            <li className="page-next">
              <span className="cursor-pointer">
                <span className="pagintaion-label">
                  <FontAwesome name="angle-left" size="2x" />
                  <span>Previous article</span>
                </span>
                <h5 className="knowledge-details-title">Stop getting emails from lorem</h5>
              </span>
            </li>
            <li className="page-previous">
              <span className="cursor-pointer">
                <span className="pagintaion-label">
                  <span>Next article</span>
                  <FontAwesome name="angle-right" size="2x" />
                </span>
                <h5 className="knowledge-details-title">Use threads to organize discussions</h5>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="related-article-list">
        <h4 className="related-article-list__title">Related articles</h4>
        <ul className="related-article">
          <li>
            <span className="related-article__single cursor-pointer">
              <span className="article-icon">
                <FontAwesome name="file" size="2x" />
              </span>
              <h5 className="related-article__title">Installing lorem multi vendor marketplace</h5>
            </span>
          </li>
          <li>
            <span className="related-article__single cursor-pointer">
              <span className="article-icon">
                <FontAwesome name="file" size="2x" />
              </span>
              <h5 className="related-article__title">Copyright and trademarks</h5>
            </span>
          </li>
          <li>
            <span className="related-article__single cursor-pointer">
              <span className="article-icon">
                <FontAwesome name="file" size="2x" />
              </span>
              <h5 className="related-article__title">Stop getting emails from lorem</h5>
            </span>
          </li>
        </ul>
      </div>
      <div className="sDash_comment-form">
        <h4 className="sDash_comment-form__title">Leave comment</h4>
        <Form name="comment" layout="vertical">
          <Row gutter="20">
            <Col sm={12} xs={24}>
              <Form.Item label="Name" name="name">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={12} xs={24}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ message: 'Please input your email!', type: 'email' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24}>
              <Form.Item label="Comment" name="comment">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24}>
              <Button htmlType="submit" className="btn-submit" size="large" type="primary" raised key="submit">
                Submit Comment
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </KnowledgeDetailsWrap>
  );
}

export default SingleKnowledgeDetails;
