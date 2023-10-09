import { useState } from 'react';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { TKeywordSearchFormValues } from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import KeywordSearchForm from '@pages/admin/partner/components/KeywordSearchForm/KeywordSearchForm';
import { Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import {
  moveFoodToMenuSteps,
  STEP_SELECT_MENU,
} from '../../helpers/moveFoodToMenu';
import { partnerFoodSliceThunks } from '../../PartnerFood.slice';
import type { TMoveFoodToMenuFormValues } from '../MoveFoodToMenuForm/MoveFoodToMenuForm';
import MoveFoodToMenuForm from '../MoveFoodToMenuForm/MoveFoodToMenuForm';

import css from './MoveFoodToMenuModal.module.scss';

type TMoveFoodToMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedFood: TListing;
  menus: TListing[];
};

const MoveFoodToMenuModal: React.FC<TMoveFoodToMenuModalProps> = (props) => {
  const { isOpen, onClose, selectedFood, menus } = props;
  const dispatch = useAppDispatch();
  const [formValues, setFormValues] = useState<TMoveFoodToMenuFormValues>();
  const [currentStep, setCurrentStep] = useState<string>(
    moveFoodToMenuSteps[0],
  );

  const updatePartnerMenuInProgress = useAppSelector(
    (state) => state.PartnerFood.updatePartnerMenuInProgress,
  );

  const { menuId } = formValues || {};

  const goBackStep = () => {
    setCurrentStep(STEP_SELECT_MENU);
  };

  const onQueryMenuSubmit = (values: TKeywordSearchFormValues) => {
    dispatch(
      partnerFoodSliceThunks.fetchActiveMenus({
        ...values,
      }),
    );
  };

  const onMoveFoodToMenuSubmit = (values: TMoveFoodToMenuFormValues) => {
    const { selectedDays } = values;
    const selectedMenu =
      menuId && menus.find((menu: TListing) => menu.id.uuid === menuId);
    const selectedMenuListing = selectedMenu && Listing(selectedMenu!);
    const {
      foodsByDate = {},
      startDate,
      endData,
    } = selectedMenuListing ? selectedMenuListing.getPublicData() : ({} as any);
    const { menuType } = selectedMenuListing
      ? selectedMenuListing.getMetadata()
      : ({} as any);
    const newFoodByDate = {
      ...foodsByDate,
      ...selectedDays.reduce((acc: any, day: string) => {
        return {
          ...acc,
          [day]: {
            ...(foodsByDate[day] || {}),
            [selectedFood?.id.uuid]: {
              id: selectedFood?.id.uuid,
              title: selectedFood?.attributes.title,
              sideDishes: selectedFood?.attributes.publicData?.sideDishes || [],
              price: selectedFood?.attributes.price.amount,
              isFoodEnable:
                selectedFood?.attributes.metadata.isFoodEnable || true,
              nutritionsList:
                selectedFood?.attributes?.publicData?.specialDiets || [],
              foodNote: '',
            },
          },
        };
      }, {}),
    };

    dispatch(
      partnerFoodSliceThunks.updatePartnerMenu({
        id: menuId,
        dataParams: {
          foodsByDate: newFoodByDate,
          menuType,
          startDate,
          endData,
        },
      }),
    );
  };

  return (
    <>
      <SlideModal
        id="MoveFoodToMenuSlideModal"
        modalTitle="Di chuyển vào menu"
        isOpen={isOpen}
        onClose={onClose}>
        <div className={css.modalContent}>
          <RenderWhen condition={!!menuId && currentStep !== STEP_SELECT_MENU}>
            <div className={css.menuNameWrapper} onClick={goBackStep}>
              <IconArrow direction="left" />
              <span>
                {menus.find((menu: TListing) => menu.id.uuid === menuId)
                  ?.attributes.title || 'Menu'}
              </span>
            </div>
            <RenderWhen.False>
              <div className={css.searchFilterWrapper}>
                <KeywordSearchForm onSubmit={onQueryMenuSubmit} />
                <Button
                  type="button"
                  variant="secondary"
                  className={css.filterBtn}>
                  <IconFilter />
                  Lọc
                </Button>
              </div>
            </RenderWhen.False>
          </RenderWhen>
          <div className={css.formWrapper}>
            <MoveFoodToMenuForm
              onSubmit={onMoveFoodToMenuSubmit}
              menus={menus}
              setFormValues={setFormValues}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              selectedFood={selectedFood}
              inProgress={updatePartnerMenuInProgress}
            />
          </div>
        </div>
      </SlideModal>
    </>
  );
};

export default MoveFoodToMenuModal;
