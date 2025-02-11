import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import EditOrderWizard from './components/EditOrderWizard/EditOrderWizard';

import css from './AdminEditOrder.module.scss';

type TAdminEditOrderProps = {};

const AdminEditOrder: React.FC<TAdminEditOrderProps> = () => {
  return (
    <div className={css.root}>
      <h2 className={classNames(css.title, 'font-semibold !text-lg mb-2')}>
        <FormattedMessage id="AdminEditOrderPage.title" />
      </h2>
      <EditOrderWizard />
    </div>
  );
};

export default AdminEditOrder;
