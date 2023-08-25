import { useMemo, useState } from 'react';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { OwnListing } from '@src/utils/data';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';

import MenuInfo from './MenuInfo';
import type { TMenuSettingsFormValues } from './MenuSettingsForm';
import MenuSettingsForm from './MenuSettingsForm';

import css from './MenuInfoModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MenuInfoModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  const viewModeController = useBoolean(true);
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );

  const isViewMode = viewModeController.value;

  const restaurantGetter = OwnListing(restaurantListing);
  const { meals = [], categories = [] } = restaurantGetter.getPublicData();

  const handleChangeViewMode = () => {
    viewModeController.toggle();
  };

  const initialValues = useMemo(
    () => ({
      meals,
      categories,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(restaurantListing)],
  );

  const handleSubmitForm = async (values: TMenuSettingsFormValues) => {
    const response = await dispatch(
      PartnerSettingsThunks.updatePartnerRestaurantListing(values),
    );

    if (response.meta.requestStatus !== 'rejected') {
      setIsSubmitted(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading}>
          <IconArrow direction="left" onClick={onClose} />
          <RenderWhen condition={isViewMode}>
            <div>Thực đơn</div>
            <div
              className={css.editIconContainer}
              onClick={handleChangeViewMode}>
              <IconEdit />
            </div>

            <RenderWhen.False>
              <div>Chỉnh sửa thực đơn</div>
            </RenderWhen.False>
          </RenderWhen>
        </div>

        <RenderWhen condition={isViewMode}>
          <MenuInfo meals={meals} categories={categories} />

          <RenderWhen.False>
            <MenuSettingsForm
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              isSubmitted={isSubmitted}
            />
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </Modal>
  );
};

export default MenuInfoModal;
