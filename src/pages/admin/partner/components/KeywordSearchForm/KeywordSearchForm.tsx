import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import IconMagnifier from '@components/Icons/IconMagnifier/IconMagnifier';
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
};

const KeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
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
              name={props?.searchValue || 'keyword'}
              id={props?.searchValue || 'keyword'}
              className={css.searchInput}
            />
            <Button className={css.searchButton} onClick={handleSubmit}>
              <IconMagnifier className={css.iconSearch} />
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default KeywordSearchForm;
