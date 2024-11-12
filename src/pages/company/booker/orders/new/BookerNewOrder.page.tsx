import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import Image from 'next/image';

import { useAppSelector } from '@hooks/reduxHooks';
import { HOMEPAGE_MEAL_LINKS } from '@pages/company/helpers/companyMeals';
import { useCompanyMealSelect } from '@pages/company/hooks/useCompanyMealSelect';
import { currentUserSelector } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser } from '@src/utils/types';

import css from './BookerNewOrder.module.scss';

const BookerNewOrderPage: React.FC = () => {
  const intl = useIntl();
  const currentUser = useAppSelector(currentUserSelector);
  const selectedCompany = useAppSelector((state) => state.Quiz.selectedCompany);

  const { firstName } = CurrentUser(currentUser as TCurrentUser).getProfile();
  const { handleMealClick } = useCompanyMealSelect();

  const isSelectedCompanyEmpty =
    selectedCompany === null || isEmpty(selectedCompany);

  const homePageLinkClasses = classNames(css.mealItem, {
    [css.disabled]: isSelectedCompanyEmpty,
  });

  const onMealClick = (daySession: string) => () => {
    if (isSelectedCompanyEmpty) {
      return;
    }
    handleMealClick(daySession);
  };

  return (
    <div className={css.root}>
      <div className={css.header}>
        <div>Đặt hàng</div>
      </div>
      <div className={css.content}>
        <div className={css.welcome}>
          {intl.formatMessage(
            { id: 'BookerNewOrder.welcome' },
            {
              bookerName: firstName,
            },
          )}
        </div>
        <div className={css.mealsWrapper}>
          {HOMEPAGE_MEAL_LINKS.map((item) => (
            <div
              key={item.key}
              className={homePageLinkClasses}
              onClick={onMealClick(item.daySession)}>
              <div className={css.labelWrapper}>
                <div className={css.label}>{item.label}</div>
                <div className={css.subLabel}>{item.subLabel}</div>
              </div>
              <Image src={item.image} className={css.image} alt={item.key} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookerNewOrderPage;
