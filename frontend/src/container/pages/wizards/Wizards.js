'use client';

import React from 'react';
import { Row, Col, Skeleton } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { usePathname } from 'next/navigation';
import { WizardBlock } from './Style';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { Main } from '../../styled';
import { Cards } from '../../../components/cards/frame/cards-frame';
import { Button } from '../../../components/buttons/buttons';
import { ShareButtonPageHeader } from '../../../components/buttons/share-button/share-button';
import { ExportButtonPageHeader } from '../../../components/buttons/export-button/export-button';
import { CalendarButtonPageHeader } from '../../../components/buttons/calendar-button/calendar-button';

// Direct imports - no lazy loading needed since route already uses dynamic()
import WizardsOne from './overview/WizardsOne';
import WizardsTwo from './overview/WizardsTwo';
import WizardsThree from './overview/WizardsThree';
import WizardsFour from './overview/WizardsFour';
import WizardsFive from './overview/WizardsFive';
import WizardsSix from './overview/WizardsSix';

function Wizards() {
  const pathname = usePathname();
  const currentView = pathname?.split('/').pop() || 'one';

  return (
    <>
      <PageHeader
        title="Wizards"
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
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <WizardBlock>
              <Cards headless>
                <Row justify="center">
                  <Col xxl={20} xs={24}>
                    {currentView === 'two' ? (
                      <WizardsTwo />
                    ) : currentView === 'three' ? (
                      <WizardsThree />
                    ) : currentView === 'four' ? (
                      <WizardsFour />
                    ) : currentView === 'five' ? (
                      <WizardsFive />
                    ) : currentView === 'six' ? (
                      <WizardsSix />
                    ) : (
                      <WizardsOne />
                    )}
                  </Col>
                </Row>
              </Cards>
            </WizardBlock>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Wizards;
