import { useState } from 'react';

import Layout from '../components/Layout/Layout';
import LayoutMain from '../components/Layout/LayoutMain';
import LayoutSidebar from '../components/Layout/LayoutSidebar';
import SidebarContent from './SidebarContent';

function BookerDraftOrderPage() {
  const [collapse, setCollapse] = useState(false);

  const handleCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <Layout>
      <LayoutSidebar
        logo={<span></span>}
        collapse={collapse}
        onCollapse={handleCollapse}>
        <SidebarContent />
      </LayoutSidebar>
      <LayoutMain>chu</LayoutMain>
    </Layout>
  );
}

export default BookerDraftOrderPage;
