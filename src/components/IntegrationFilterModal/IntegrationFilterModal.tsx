import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconFilter from '@components/IconFilter/IconFilter';
import Modal from '@components/Modal/Modal';
import useBoolean from '@hooks/useBoolean';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import css from './IntegrationFilterModal.module.scss';

const IntegrationFilterModal = (props: any) => {
  const { onSubmit, onClear, children, initialValues = {} } = props;
  const {
    value: isOpen,
    setFalse: onClose,
    setTrue: onOpen,
  } = useBoolean(false);
  return (
    <div className={css.root}>
      <Button onClick={onOpen} type="button" className={css.filterButton}>
        <IconFilter className={css.filterIcon} />
        <FormattedMessage id="IntegrationFilterModal.filterMessage" />
      </Button>
      <Modal
        containerClassName={css.modalContainer}
        isOpen={isOpen}
        handleClose={onClose}>
        <FinalForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          render={(fieldRenderProps) => {
            const { handleSubmit, values, form } = fieldRenderProps;
            return (
              <Form className={css.filterForm} onSubmit={handleSubmit}>
                <>
                  {children({ values, form })}
                  <div className={css.formButtons}>
                    <Button
                      onClick={onClear}
                      type="button"
                      className={css.leftButton}>
                      <FormattedMessage id="IntegrationFilterModal.clearBtn" />
                    </Button>
                    <div className={css.rightButtons}>
                      <Button
                        onClick={onClose}
                        type="button"
                        className={css.discardButton}>
                        <FormattedMessage id="IntegrationFilterModal.filterFormDiscardBtn" />
                      </Button>
                      <Button className={css.submitButton}>
                        <FormattedMessage id="IntegrationFilterModal.filterFormBtn" />
                      </Button>
                    </div>
                  </div>
                </>
              </Form>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default IntegrationFilterModal;
