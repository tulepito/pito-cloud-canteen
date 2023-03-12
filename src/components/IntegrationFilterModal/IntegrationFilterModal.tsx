/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
import type { ReactNode } from 'react';
import React, { useRef } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import type { FormApi } from 'final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import AlertModal from '@components/Modal/AlertModal';
import useBoolean from '@hooks/useBoolean';
import type { TObject } from '@utils/types';

import css from './IntegrationFilterModal.module.scss';

type TIntegrationFilterModal = {
  onSubmit: (values: TObject) => void;
  children: ({
    values,
    form,
  }: {
    values: Record<any, any>;
    form: FormApi;
  }) => ReactNode;
  initialValues: Record<any, any>;
  onClear: () => void;
  className?: string;
  title?: string | ReactNode;
};

const IntegrationFilterModal: React.FC<TIntegrationFilterModal> = (props) => {
  const {
    onSubmit,
    children,
    initialValues = {},
    onClear,
    className,
    title,
  } = props;
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

  const handleCancel = () => {
    onClose();
    onClear && onClear();
  };

  return (
    <div className={classNames(css.root, className)}>
      <Button
        onClick={onOpen}
        type="button"
        variant="secondary"
        className={css.filterButton}>
        <IconFilter className={css.filterIcon} />
        <FormattedMessage id="IntegrationFilterModal.filterMessage" />
      </Button>
      <AlertModal
        title={title}
        onCancel={handleCancel}
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
