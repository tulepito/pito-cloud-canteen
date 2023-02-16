import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import classNames from 'classnames';
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
  className?: string;
};

const KeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
  const intl = useIntl();
  const { placeholder, className } = props;
  return (
    <FinalForm
      {...props}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        return (
          <Form
            onSubmit={handleSubmit}
            className={classNames(css.root, className)}>
            <FieldTextInput
              placeholder={
                placeholder ||
                intl.formatMessage({
                  id: 'KeywordSearchForm.keywordPlaceholder',
                })
              }
              name={props?.searchValue || 'keywords'}
              id={props?.searchValue || 'keywords'}
              className={css.searchInput}
              leftIcon={<IconSearch />}
            />
          </Form>
        );
      }}
    />
  );
};

export default KeywordSearchForm;
