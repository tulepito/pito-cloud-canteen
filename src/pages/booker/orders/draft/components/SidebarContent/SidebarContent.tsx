import Badge from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import classNames from 'classnames';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import AccessForm from '../../forms/AccessForm';
import DeliveryTimeForm from '../../forms/DeliveryTimeForm';
import ExpiredTimeForm from '../../forms/ExpiredTimeForm';
import LocationForm from '../../forms/LocationForm';
import NumberEmployeesForm from '../../forms/NumberEmployeesForm';
import NutritionForm from '../../forms/NutritionForm';
import UnitBudgetForm from '../../forms/UnitBudgetForm';
import css from './SidebarContent.module.scss';

type TSidebarContentProps = {
  className?: string;
};

type TNavigationItemProps = {
  messageId?: string;
  onOpen?: (id: string | boolean) => void;
};

const NavigationItem: React.FC<TNavigationItemProps> = ({
  messageId,
  onOpen = () => null,
}) => {
  const handleOpenDetails = () => {
    onOpen(messageId || false);
  };

  return (
    <div className={css.navItem} onClick={handleOpenDetails}>
      <FormattedMessage id={`SidebarContent.nav.settings.${messageId}`} />
      <IconArrow direction="right" />
    </div>
  );
};

const SidebarContent: React.FC<TSidebarContentProps> = ({ className }) => {
  const classes = classNames(css.root, className);

  const [isOpenDetails, setIsOpenDetails] = useState<string | boolean>(false);

  const handleOpenDetails = (id: string | boolean) => {
    setIsOpenDetails(id);
  };

  const handleCloseDetails = () => {
    setIsOpenDetails(false);
  };

  const renderForm = () => {
    switch (isOpenDetails) {
      case 'location':
        return <LocationForm onSubmit={() => null} />;
      case 'deliveryTime':
        return <DeliveryTimeForm onSubmit={() => null} />;
      case 'expiredTime':
        return <ExpiredTimeForm onSubmit={() => null} />;
      case 'numberEmployees':
        return <NumberEmployeesForm onSubmit={() => null} />;
      case 'nutrition':
        return <NutritionForm onSubmit={() => null} />;
      case 'access':
        return <AccessForm onSubmit={() => null} />;
      case 'unitBudget':
        return <UnitBudgetForm onSubmit={() => null} />;
      default:
        return null;
    }
  };

  return (
    <div className={classes}>
      <div
        className={classNames(css.main, {
          [css.hideMain]: isOpenDetails,
        })}>
        <div className={css.header}>
          <h2 className={css.title}>#PT1000</h2>
          <Badge label="Đơn hàng tuần" type="processing" />
        </div>
        <nav className={css.navigation}>
          <NavigationItem onOpen={handleOpenDetails} messageId="location" />
          <NavigationItem onOpen={handleOpenDetails} messageId="deliveryTime" />
          <NavigationItem onOpen={handleOpenDetails} messageId="expiredTime" />
          <NavigationItem
            onOpen={handleOpenDetails}
            messageId="numberEmployees"
          />
          <NavigationItem onOpen={handleOpenDetails} messageId="nutrition" />
          <NavigationItem onOpen={handleOpenDetails} messageId="access" />
          <NavigationItem onOpen={handleOpenDetails} messageId="unitBudget" />
        </nav>
      </div>

      <div
        className={classNames(css.detailContent, {
          [css.showDetailContent]: isOpenDetails,
        })}>
        <div className={css.goBack}>
          <span className={css.goBackClickArea} onClick={handleCloseDetails}>
            <IconArrow className={css.iconBack} direction="left" />
            <FormattedMessage id="SidebarContent.details.goBack" />
          </span>
        </div>
        <div className={css.detailsTitle}>
          {isOpenDetails && (
            <FormattedMessage
              id={`SidebarContent.nav.settings.${isOpenDetails}`}
            />
          )}
        </div>
        <div className={css.detailsForm}>{renderForm()}</div>
      </div>
    </div>
  );
};

export default SidebarContent;
