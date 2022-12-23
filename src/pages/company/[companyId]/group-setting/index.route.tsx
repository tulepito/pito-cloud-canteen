import { addWorkspaceCompanyId } from '@redux/slices/company.slice';
import wrapper from '@redux/store';

import GroupSettingPage from './GroupSetting.page';

function GroupSettingRoute() {
  return <GroupSettingPage />;
}

GroupSettingRoute.getInitialPageProps = wrapper.getInitialPageProps(
  (store) => async (context) => {
    const { companyId } = context.query;
    // regular stuff
    console.log('context: ');
    store.dispatch(addWorkspaceCompanyId(companyId));
    console.log('run dispatch');
    // console.log('store: ', store);
    // await store.dispatch(BookerManageCompany.companyInfo());
    return {
      props: {},
    };
  },
);

export default GroupSettingRoute;
