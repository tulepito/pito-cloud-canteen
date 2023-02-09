import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './KeywordSearchForm.module.scss';

export type TKeywordSearchFormValues = {
  keywords?: string;
};

type TKeywordSearchForm = {
  onSubmit: (e: TKeywordSearchFormValues) => void;
  initialValues?: TKeywordSearchFormValues;
  searchValue?: string;
  placeholder?: string;
  hideButton?: boolean;
  inputClassName?: string;
  label?: ReactNode;
  buttonClassName?: string;
};

const KeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
  const intl = useIntl();
  const { placeholder, hideButton, inputClassName, label, buttonClassName } =
    props;
  return (
    <FinalForm
      {...props}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} className={css.root}>
            <FieldTextInput
              placeholder={
                placeholder ||
                intl.formatMessage({
                  id: 'KeywordSearchForm.keywordPlaceholder',
                })
              }
              name={props?.searchValue || 'keywords'}
              label={label}
              id={props?.searchValue || 'keywords'}
              className={classNames(css.searchInput, inputClassName)}
              leftIcon={<IconMagnifier />}
            />
            {!hideButton && (
              <Button
                className={classNames(css.searchButton, buttonClassName)}
                onClick={handleSubmit}>
                <IconMagnifier className={css.iconSearch} />
              </Button>
            )}
          </Form>
        );
      }}
    />
  );
};

export default KeywordSearchForm;
