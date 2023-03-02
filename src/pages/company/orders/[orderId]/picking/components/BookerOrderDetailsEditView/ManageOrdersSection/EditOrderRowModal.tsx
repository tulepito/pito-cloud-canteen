import Modal from '@components/Modal/Modal';
import { parseThousandNumber } from '@helpers/format';
import type { TObject } from '@utils/types';
import { useIntl } from 'react-intl';

import type { TEditOrderRowFormValues } from './EditOrderRowForm';
import EditOrderRowForm from './EditOrderRowForm';
import css from './EditOrderRowModal.module.scss';

type TEditOrderRowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  foodOptions: any[];
  onSubmit: (values: TEditOrderRowFormValues) => void;
  currentMemberOrderData: TObject;
  packagePerMember: number;
};

const EditOrderRowModal: React.FC<TEditOrderRowModalProps> = (props) => {
  const intl = useIntl();
  const {
    onClose,
    isOpen,
    onSubmit,
    foodOptions,
    currentMemberOrderData,
    packagePerMember,
  } = props;
  const { memberData, foodData } = currentMemberOrderData || {};
  const initialValues = {
    foodId: foodData?.foodId || '',
    requirement: foodData?.requirement || '',
    memberName: memberData?.name || {},
  };

  return (
    <Modal
      className={css.root}
      containerClassName={css.modalContainer}
      handleClose={onClose}
      isOpen={isOpen}
      title={intl.formatMessage({
        id: 'EditOrderRowModal.title',
      })}>
      <div>
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
    </Modal>
  );
};

export default EditOrderRowModal;
