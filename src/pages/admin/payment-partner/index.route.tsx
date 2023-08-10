import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import PaymentPartnerPage from './PaymentPartner.page';

export default function AdminHomePageRoute() {
  return (
    <MetaWrapper routeName="AdminPartnerPaymentRoute">
      <PaymentPartnerPage />
    </MetaWrapper>
  );
}
