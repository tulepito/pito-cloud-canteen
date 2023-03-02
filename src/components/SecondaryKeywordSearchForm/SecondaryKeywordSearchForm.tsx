import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './SecondaryKeywordSearchForm.module.scss';

export type TSecondaryKeywordSearchFormValues = {
  keywords?: string;
};

type TKeywordSearchForm = {
  onSubmit: (e: TSecondaryKeywordSearchFormValues) => void;
  initialValues?: TSecondaryKeywordSearchFormValues;
  searchValue?: string;
  placeholder?: string;
};

const SecondaryKeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
  const intl = useIntl();
  const { placeholder } = props;
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
              id={props?.searchValue || 'keywords'}
              className={css.searchInput}
              leftIcon={<IconMagnifier className={css.iconSearch} />}
            />
          </Form>
        );
      }}
    />
  );
};

export default SecondaryKeywordSearchForm;
