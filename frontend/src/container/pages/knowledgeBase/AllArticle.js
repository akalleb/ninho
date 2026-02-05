import React, { useState } from 'react';
import { Collapse } from 'antd';
import { NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import GeneralKnowledgeTop from './overview/GeneralKnowledgeTop';
import { KnowledgebaseArticleWrap, ArticleListWrap, CtaWrap } from './style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Button } from '../../../components/buttons/buttons';
import { Main } from '../../styled';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';
function AllArticle() {
  const [state, setstate] = useState({
    key: 0,
  });
  const callback = (key) => {
    setstate({ ...state, key });
  };
  return (
    <>
      <PageHeader
        title="All Article"
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      />
      <Main>
        <GeneralKnowledgeTop />
        <KnowledgebaseArticleWrap>
          <div className="knowledgebase-article-container theme-2">
            <div className="sDash_paginaion">
              <ul>
                <li>
                  <NextLink className="active" to="/admin/pages/knowledgeBase/plugins">
                    Doc Home
                  </NextLink>
                </li>
                <li>
                  <span>Plugins</span>
                </li>
              </ul>
            </div>
            <ArticleListWrap>
              <div className="sDash_articlelist">
                <div className="sDash_articlelist__single">
                  <div className="sDash_articlelist__single--left">
                    <h2 className="sDash_article-category-title">Introduction to Plugin</h2>
                  </div>
                  <div className="sDash_articlelist__single--right">
                    <div className="sDash_article-category-links">
                      <ul>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">
                            Log in and out of plugins view your success and other stats
                          </NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Log in and out of Plugins</NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                        <li>
                          <Collapse
                            onChange={callback}
                            items={[
                              {
                                key: '1',
                                label: (
                                  <>
                                    <span className="cursor-pointer">Switch between accounts</span>
                                  </>
                                ),
                                children: (
                                  <ul>
                                    <li>
                                      <span className="cursor-pointer">Log in and out of Plugins</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Reactivate your account</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                  </ul>
                                ),
                              },
                            ]}
                          />
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="sDash_articlelist__single">
                  <div className="sDash_articlelist__single--left">
                    <h2 className="sDash_article-category-title">Productivity tools for your Plugin admin</h2>
                  </div>
                  <div className="sDash_articlelist__single--right">
                    <div className="sDash_article-category-links">
                      <ul>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">
                            Log in and out of plugins view your success and other stats
                          </NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Log in and out of Plugins</NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                        <li>
                          <Collapse
                            onChange={callback}
                            items={[
                              {
                                key: '1',
                                label: (
                                  <>
                                    <span className="cursor-pointer">Switch between accounts</span>
                                  </>
                                ),
                                children: (
                                  <ul>
                                    <li>
                                      <span className="cursor-pointer">Log in and out of Plugins</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Reactivate your account</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                  </ul>
                                ),
                              },
                            ]}
                          />
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="sDash_articlelist__single">
                  <div className="sDash_articlelist__single--left">
                    <h2 className="sDash_article-category-title">Manage your account</h2>
                  </div>
                  <div className="sDash_articlelist__single--right">
                    <div className="sDash_article-category-links">
                      <ul>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">
                            Log in and out of plugins view your success and other stats
                          </NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Log in and out of Plugins</NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                        <li>
                          <Collapse
                            onChange={callback}
                            items={[
                              {
                                key: '1',
                                label: (
                                  <>
                                    <span className="cursor-pointer">Switch between accounts</span>
                                  </>
                                ),
                                children: (
                                  <ul>
                                    <li>
                                      <span className="cursor-pointer">Log in and out of Plugins</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Reactivate your account</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                  </ul>
                                ),
                              },
                            ]}
                          />
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="sDash_articlelist__single">
                  <div className="sDash_articlelist__single--left">
                    <h2 className="sDash_article-category-title">Manage your account</h2>
                  </div>
                  <div className="sDash_articlelist__single--right">
                    <div className="sDash_article-category-links">
                      <ul>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">
                            Log in and out of plugins view your success and other stats
                          </NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Log in and out of Plugins</NextLink>
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                        <li>
                          <Collapse
                            onChange={callback}
                            items={[
                              {
                                key: '1',
                                label: (
                                  <>
                                    <span className="cursor-pointer">Switch between accounts</span>
                                  </>
                                ),
                                children: (
                                  <ul>
                                    <li>
                                      <span className="cursor-pointer">Log in and out of Plugins</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Reactivate your account</span>
                                    </li>
                                    <li>
                                      <span className="cursor-pointer">Change your email</span>
                                    </li>
                                  </ul>
                                ),
                              },
                            ]}
                          />
                        </li>
                        <li>
                          <NextLink to="/admin/pages/knowledgebaseSingle/1">Switch between accounts</NextLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <CtaWrap>
                <div className="sDash_knowledgebase-cta">
                  <h2 className="sDash_knowledgebase-cta__title">Still no luck? We can help!</h2>
                  <p>Contact us and we’ll get back to you as soon as possible.</p>
                  <Button className="btn-rqSubmit" type="primary" size="large">
                    Submit a Request
                  </Button>
                </div>
              </CtaWrap>
            </ArticleListWrap>
          </div>
        </KnowledgebaseArticleWrap>
      </Main>
    </>
  );
}

export default AllArticle;
