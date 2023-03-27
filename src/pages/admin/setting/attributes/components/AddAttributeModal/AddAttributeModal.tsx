import { useMemo } from 'react';

import Modal from '@components/Modal/Modal';
import { EAttributeSetting } from '@src/utils/enums';

import type { TAddAttributeFormValues } from '../AddAttributeForm/AddAttributeForm';
import AddAttributeForm from '../AddAttributeForm/AddAttributeForm';

import css from './AddAttributeModal.module.scss';

type TAddAttributeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddAttribute: (
    attribute: EAttributeSetting,
    label: string,
    time: { start: string; end: string },
  ) => void;
  setSubmitError: (error: string) => void;
  inProgress: boolean;
  submitErrorText?: string;
  activeTab: EAttributeSetting;
};

const AddAttributeModal: React.FC<TAddAttributeModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    onAddAttribute,
    inProgress,
    submitErrorText,
    activeTab,
    setSubmitError,
  } = props;
  const onSubmit = (values: TAddAttributeFormValues) => {
    onAddAttribute(values.attribute, values[values.attribute]!, {
      start: values.start!,
      end: values.end!,
    });
  };
  const initialValues: TAddAttributeFormValues = useMemo(
    () => ({
      attribute: activeTab || EAttributeSetting.MEAL_STYLES,
    }),
    [activeTab],
  );

  if (!isOpen) return null;

  return (
    <Modal
      id="AddAttributeModal"
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title="Thêm">
      <div className={css.container}>
        <AddAttributeForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          inProgress={inProgress}
          submitErrorText={submitErrorText}
          setSubmitError={setSubmitError}
        />
      </div>
    </Modal>
  );
};

export default AddAttributeModal;
