import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import IconMagnifier from '@components/IconMagnifier/IconMagnifier';
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './KeywordSearchForm.module.scss';

export type TKeywordSearchFormValues = {
  keyword?: string;
};

type TKeywordSearchForm = {
  onSubmit: (e: TKeywordSearchFormValues) => void;
  initialValues?: TKeywordSearchFormValues;
};

const KeywordSearchForm: React.FC<TKeywordSearchForm> = (props) => {
  const intl = useIntl();
  return (
    <FinalForm
      {...props}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} className={css.root}>
            <FieldTextInput
              placeholder={intl.formatMessage({
                id: 'KeywordSearchForm.keywordPlaceholder',
              })}
              name="keyword"
              id="keyword"
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
