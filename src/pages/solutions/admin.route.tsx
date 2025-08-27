import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Admin from '@pages/website/pages/Admin';
import Layout from '@pages/website/pages/Layout';
import { websitePaths } from '@src/paths';

function Page() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="AdminRoute"
      title={intl.formatMessage({
        id: 'giam-ganh-nang-quan-ly-bua-trua-cung-pito-cloud-canteen',
      })}
      description={intl.formatMessage({
        id: 'admin-tiet-kiem-80-thoi-gian-quan-ly-ngan-sach-and-phan-hoi-chi-trong-mot-nen-tang-khong-con-excel-zalo-thu-cong',
      })}
      canonical={websitePaths.Admin}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <Admin />
      </Layout>
    </MetaWrapper>
  );
}

export default Page;
