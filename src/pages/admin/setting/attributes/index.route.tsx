import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import AttributesSettingPage from './Attributes.page';

export default function AttributesSettingPageRoute() {
  return (
    <MetaWrapper routeName="AdminAttributeSettingPageRoute">
      <AttributesSettingPage />
    </MetaWrapper>
  );
}
