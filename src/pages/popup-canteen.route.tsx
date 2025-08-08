import React from 'react';
import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import { websitePaths } from '@src/paths';

import PopupCanteen from './website/pages/PopupCanteen';

function PopupCanteenPage() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="PopupCanteenRoute"
      title={intl.formatMessage({
        id: 'bua-trua-tu-dong-cho-doanh-nghiep-lon-or-pito-cloud-canteen',
      })}
      description={intl.formatMessage({
        id: 'don-gian-hoa-viec-dat-bua-trua-cho-100-2000-nhan-su-nhan-vien-tu-chon-mon-pito-setup-canteen-tai-cho-khong-can-bep-an-noi-bo',
      })}
      canonical={websitePaths.PopupCanteen}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <PopupCanteen />
      </Layout>
    </MetaWrapper>
  );
}

export default PopupCanteenPage;
