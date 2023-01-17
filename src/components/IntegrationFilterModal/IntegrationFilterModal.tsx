/* eslint-disable @typescript-eslint/no-shadow */
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconFilter from '@components/IconFilter/IconFilter';
import AlertModal from '@components/Modal/AlertModal';
import useBoolean from '@hooks/useBoolean';
import type { FormApi } from 'final-form';
import React, { useRef } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './IntegrationFilterModal.module.scss';

const IntegrationFilterModal = (props: any) => {
  const { onSubmit, children, initialValues = {} } = props;
  const formRef = useRef<FormApi>();
  const {
    value: isOpen,
    setFalse: onClose,
    setTrue: onOpen,
  } = useBoolean(false);

  const intl = useIntl();

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  return (
    <div className={css.root}>
      <Button onClick={onOpen} type="button" className={css.filterButton}>
        <IconFilter className={css.filterIcon} />
        <FormattedMessage id="IntegrationFilterModal.filterMessage" />
      </Button>
      <AlertModal
        onCancel={onClose}
        onConfirm={handleSubmit}
        isOpen={isOpen}
        containerClassName={css.container}
        handleClose={onClose}
        cancelLabel={intl.formatMessage({
          id: 'IntegrationFilterModal.filterFormDiscardBtn',
        })}
        confirmLabel={intl.formatMessage({
          id: 'IntegrationFilterModal.filterFormBtn',
        })}>
        <FinalForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          render={(fieldRenderProps) => {
            const { handleSubmit, form, values } = fieldRenderProps;
            formRef.current = form;
            return (
              <Form className={css.filterForm} onSubmit={handleSubmit}>
                <>{children({ values, form })}</>
              </Form>
            );
          }}
        />
      </AlertModal>
    </div>
  );
};

export default IntegrationFilterModal;
