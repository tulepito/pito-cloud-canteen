import { FormattedMessage } from 'react-intl';

import CreateOrderWizard from './components/CreateOrderWizard/CreateOrderWizard';
import css from './CreateOrder.module.scss';

const CreateOrderPage = () => {
  return (
    <>
      <h2 className={css.title}>
        <FormattedMessage id="CreateOrderPage.title" />
      </h2>
      <CreateOrderWizard />
    </>
  );
};

export default CreateOrderPage;
