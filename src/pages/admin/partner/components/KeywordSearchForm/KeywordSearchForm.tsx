import type { ReactNode } from 'react';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';

import css from './KeywordSearchForm.module.scss';

export type TKeywordSearchFormValues = {
  keywords?: string;
};

type TKeywordSearchForm = {
  onSubmit: (e: TKeywordSearchFormValues) => void;
  initialValues?: TKeywordSearchFormValues;
  searchValue?: string;
  placeholder?: string;
  inputClassName?: string;
  label?: ReactNode;
  className?: string;
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  fullWidth?: boolean;
};

const KeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
  const intl = useIntl();
  const {
    placeholder,
    inputClassName,
    label,
    className,
    autoComplete,
    onFocus,
    onBlur,
    fullWidth,
  } = props;

  return (
    <FinalForm
      {...props}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;

        return (
          <Form
            onSubmit={handleSubmit}
            className={classNames(css.root, className, {
              [css.fullWidth]: fullWidth,
            })}>
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
              className={classNames(css.searchInput, inputClassName, {
                [css.fullWidth]: fullWidth,
              })}
              leftIcon={<IconMagnifier />}
              autoComplete={autoComplete}
              onFocus={onFocus}
              customOnBlur={onBlur}
            />
          </Form>
        );
      }}
    />
  );
};

export default KeywordSearchForm;
