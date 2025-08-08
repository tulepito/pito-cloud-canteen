import { useIntl } from 'react-intl';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import Layout from '@pages/website/pages/Layout';
import { websitePaths } from '@src/paths';

import MealBox from './website/pages/MealBox';

function MealBoxDeliveryPage() {
  const intl = useIntl();

  return (
    <MetaWrapper
      routeName="MealBoxDeliveryRoute"
      title={intl.formatMessage({
        id: 'giai-phap-dat-bua-trua-tu-dong-cho-nhom-20-99-nguoi',
      })}
      description={intl.formatMessage({
        id: 'tu-dong-len-ke-hoach-bua-trua-cung-pito-nhan-vien-chu-dong-chon-mon-quan-ly-ca-tuan-de-dang-giao-dung-gio-khong-can-xu-ly-thu-cong',
      })}
      canonical={websitePaths.MealBoxDelivery}
      imageUrl="https://in.pito.vn/wp-content/uploads/2024/11/thumbnail-pito-cloud-canteen.jpg">
      <Layout>
        <MealBox />
      </Layout>
    </MetaWrapper>
  );
}

export default MealBoxDeliveryPage;
