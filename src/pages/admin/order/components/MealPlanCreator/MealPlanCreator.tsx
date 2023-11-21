import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import Button from '@components/Button/Button';
import { calculateGroupMembersAmount } from '@helpers/company';
import { parseDateFromTimestampAndHourString } from '@helpers/dateHelpers';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import CalendarPage from '@src/pages/calendar/CalendarPage.page';

import OrderSettingModal, {
  OrderSettingField,
} from '../OrderSettingModal/OrderSettingModal';

import css from './MealPlanCreator.module.scss';

type MealPlanCreatorProps = {
  goBack: () => void;
  nextTab: () => void;
};

const MealPlanCreator: React.FC<MealPlanCreatorProps> = () => {
  const intl = useIntl();
  const {
    value: isOrderSettingModalOpen,
    setFalse: onOrderSettingModalClose,
    setTrue: onOrderSettingModalOpen,
  } = useBoolean();
  const {
    draftOrder: {
      clientId,
      packagePerMember,
      selectedGroups = [],
      deliveryHour,
      deliveryAddress,
      deadlineDate,
      deadlineHour,
    },
  } = useAppSelector((state) => state.Order, shallowEqual);
  const { address } = deliveryAddress || {};
  const companies = useAppSelector(
    (state) => state.company.companyRefs,
    shallowEqual,
  );
  const currentClient = companies.find(
    (company) => company.id.uuid === clientId,
  );
  const allCompanyGroups =
    currentClient?.attributes.profile.metadata.groups?.reduce(
      (result: any, group: any) => {
        return {
          ...result,
          [group.id]: group.name,
        };
      },
      {},
    );
  const selectedGroupsName = selectedGroups.map((groupId: string) => {
    if (groupId === 'allMembers') {
      return intl.formatMessage({ id: 'ParticipantSetupField.allMembers' });
    }

    return allCompanyGroups[groupId];
  });
  const pickingDeadline = parseDateFromTimestampAndHourString(
    deadlineDate,
    deadlineHour,
    'yyyy-MM-dd, hh:mm',
  );
  const allMembersAmount =
    currentClient && calculateGroupMembersAmount(currentClient, selectedGroups);

  const initialFieldValues = {
    [OrderSettingField.COMPANY]:
      currentClient?.attributes.profile.publicData.companyName,
    [OrderSettingField.DELIVERY_ADDRESS]: address,
    [OrderSettingField.DELIVERY_TIME]: deliveryHour,
    [OrderSettingField.PICKING_DEADLINE]: pickingDeadline,
    [OrderSettingField.EMPLOYEE_AMOUNT]: allMembersAmount,
    [OrderSettingField.SPECIAL_DEMAND]: '',
    [OrderSettingField.ACCESS_SETTING]: selectedGroupsName?.join(', '),
    [OrderSettingField.PER_PACK]: packagePerMember,
  };

  return (
    <div className={css.container}>
      <Button onClick={onOrderSettingModalOpen}>Setting</Button>
      <CalendarPage />
      <OrderSettingModal
        isOpen={isOrderSettingModalOpen}
        onClose={onOrderSettingModalClose}
        initialFieldValues={initialFieldValues}
      />
    </div>
  );
};

export default MealPlanCreator;
