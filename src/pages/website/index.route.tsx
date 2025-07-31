import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { generalPaths } from '@src/paths';

import Home from './pages/Home';
import Layout from './pages/Layout';

function Homepage() {
  return (
    <MetaWrapper
      title="Giải pháp tự động hóa đặt cơm trưa cho doanh nghiệp"
      description="PITO Cloud Canteen giúp doanh nghiệp lập kế hoạch bữa ăn, chọn nhà cung cấp, quản lý và giao tận nơi – không phí setup, tiết kiệm thời gian."
      routeName="HomeRoute"
      canonical={generalPaths.Home}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <Home />
      </Layout>
    </MetaWrapper>
  );
}

export default Homepage;
