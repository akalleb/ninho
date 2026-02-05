'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

const ContactLoading = () => (
  <div className="p-50 text-center d-flex align-items-center justify-content-center min-h-400">
    <Spin />
  </div>
);

const Contact = dynamic(() => import('../../../../src/container/contact/Contact'), {
  ssr: false,
  loading: () => <ContactLoading />,
});

const ContactGrid = dynamic(() => import('../../../../src/container/contact/ContactGrid'), {
  ssr: false,
  loading: () => <ContactLoading />,
});

const ContactAddNew = dynamic(() => import('../../../../src/container/contact/AddNew'), {
  ssr: false,
  loading: () => <ContactLoading />,
});

function ContactRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = Contact;

  if (slug === 'grid') {
    Component = ContactGrid;
  } else if (slug === 'addNew') {
    Component = ContactAddNew;
  } else if (slug === 'list') {
    Component = Contact;
  }

  return <Component />;
}

export default withAdminLayoutNext(ContactRoutesPage);

