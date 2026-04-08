'use client';

import React, { useMemo } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Spin } from 'antd';
import { usePathname } from 'next/navigation';
import { NextNavLink, NextLink } from '../../../components/utilities/NextLink';
import FeatherIcon from 'feather-icons-react';
import { ArrowRightOutlined } from '@ant-design/icons';
import KnowledgeBaseTop from './overview/Knowledgebase/knowledgeTop';
import { KnowledgebaseArticleWrap, ArticleTabWrap, PopularArticleWrap, CtaWrap } from './style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Button } from '../../../components/buttons/buttons';
import { Main } from '../../styled';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';

import articles from '../../../demoData/article.json';

// Direct imports - no lazy loading needed since route already uses dynamic()
import Plugins from './overview/ArticlePlugin';
import Themes from './overview/ArticleTheme';
import Extensions from './overview/ArticleExtension';

function KnowledgeBase() {
  const pathname = usePathname();

  // Determine current view from pathname
  const currentView = useMemo(() => {
    if (!pathname) return 'plugins';
    const path = pathname.toLowerCase();
    if (path.includes('/themes')) return 'themes';
    if (path.includes('/extensions')) return 'extensions';
    return 'plugins'; // default
  }, [pathname]);

  return (
    <>
      <PageHeader
        title="Knowledgebase"
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
        <KnowledgeBaseTop />
        <KnowledgebaseArticleWrap>
          <div className="knowledgebase-article-container">
            <ArticleTabWrap className="sDash_article-tab">
              <div className="sDash_article-tab__menu">
                <nav>
                  <ul>
                    <li>
                      <NextNavLink to="/admin/pages/knowledgeBase/plugins">Plugins</NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to="/admin/pages/knowledgeBase/themes">Themes</NextNavLink>
                    </li>
                    <li>
                      <NextNavLink to="/admin/pages/knowledgeBase/extensions">Extensions</NextNavLink>
                    </li>
                  </ul>
                </nav>
              </div>

              <div>
                {currentView === 'themes' ? <Themes /> : currentView === 'extensions' ? <Extensions /> : <Plugins />}
              </div>
            </ArticleTabWrap>
            <PopularArticleWrap>
              <div className="sDash_popular-article sDash_popular-article-container">
                <h2 className="sDash_popular-article__title">Popular articles</h2>
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 767: 2, 900: 3 }}>
                  <Masonry className="sDash_popular-article__box" gutter="15px">
                    {articles.map((article, i) => (
                      <div className={`sDash_popular-article__single theme-${article.type}`} key={i}>
                        <h4 className="single-article-title">{article.title}</h4>
                        <p>{article.text}</p>
                        <NextLink className="btn-link" href="/admin/pages/knowledgebaseSingle/1">
                          Read more
                          <ArrowRightOutlined />
                        </NextLink>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              </div>
            </PopularArticleWrap>
            <CtaWrap>
              <div className="sDash_knowledgebase-cta">
                <h2 className="sDash_knowledgebase-cta__title">Still no luck? We can help!</h2>
                <p>Contact us and we’ll get back to you as soon as possible.</p>
                <Button className="btn-rqSubmit" type="primary" size="large">
                  Submit a Request
                </Button>
              </div>
            </CtaWrap>
          </div>
        </KnowledgebaseArticleWrap>
      </Main>
    </>
  );
}

export default KnowledgeBase;
