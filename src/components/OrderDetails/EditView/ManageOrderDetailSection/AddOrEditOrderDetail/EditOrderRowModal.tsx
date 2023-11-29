import { useIntl } from 'react-intl';

import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { parseThousandNumber } from '@helpers/format';
import { useViewport } from '@hooks/useViewport';
import type { TObject } from '@utils/types';

import type { TEditOrderRowFormValues } from './EditOrderRowForm';
import EditOrderRowForm from './EditOrderRowForm';

import css from './EditOrderRowModal.module.scss';

type TEditOrderRowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  foodOptions: any[];
  onSubmit: (values: TEditOrderRowFormValues) => void;
  currentMemberOrderData?: TObject;
  packagePerMember: number;
};

const EditOrderRowModal: React.FC<TEditOrderRowModalProps> = (props) => {
  const {
    onClose,
    isOpen,
    onSubmit,
    foodOptions,
    currentMemberOrderData = {},
    packagePerMember,
  } = props;
  const intl = useIntl();
  const { isMobileLayout } = useViewport();

  const { memberData = {}, foodData = {} } = currentMemberOrderData;
  const initialValues = {
    foodId: foodData.foodId || '',
    requirement: foodData.requirement || '',
    memberName: memberData.name || '',
  };

  const modalTitle = intl.formatMessage({
    id: 'EditOrderRowModal.title',
  });
  const content = (
    <>
      <div className={css.subTitle}>
        {intl.formatMessage(
          { id: 'EditOrderRowModal.subtitle' },
          {
            packagePerMember: (
              <b>{parseThousandNumber(packagePerMember.toString())}đ</b>
            ),
          },
        )}
      </div>
      <EditOrderRowForm
        onSubmit={onSubmit}
        foodOptions={foodOptions}
        initialValues={initialValues}
      />
    </>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <SlideModal
        id="ManageParticipantsMobileModal"
        contentClassName={css.mobileModalContent}
        modalTitle={modalTitle}
        onClose={onClose}
        isOpen={isOpen}>
        {content}
      </SlideModal>

      <RenderWhen.False>
        <Modal
          className={css.root}
          containerClassName={css.modalContainer}
          handleClose={onClose}
          isOpen={isOpen}
          title={modalTitle}>
          {content}
        </Modal>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default EditOrderRowModal;
