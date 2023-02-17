import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import React from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import css from './ResultDetailModal.module.scss';

export type TResultDetailFiltersValues = {
  selectAll: boolean;
  keyword: string;
};

const ResultDetailFilters: React.FC = () => {
  const intl = useIntl();

  const initialValues = {};

  const handleSearch = () => {
    console.log('submit');
  };

  const { form, handleSubmit } = useForm<TResultDetailFiltersValues>({
    onSubmit: handleSearch,
    initialValues,
  });

  const selectAllField = useField('selectAll', form);
  const keywordField = useField('keyword', form);

  return (
    <form onSubmit={handleSubmit} className={css.filters}>
      <div className={css.filterItem}>
        <div className={css.checbox}>
          <input
            className={css.input}
            id={'selectAll'}
            type="checkbox"
            {...selectAllField.input}
            checked={selectAllField.input.value}
          />
          <label className={css.label} htmlFor={'selectAll'}>
            <span className={css.checkboxWrapper}>
              <IconCheckbox
                checkedClassName={css.checked}
                boxClassName={css.box}
              />
            </span>
            <span className={css.labelText}>
              {intl.formatMessage({
                id: 'booker.orders.draft.resultDetailModal.selectAll',
              })}
            </span>
          </label>
        </div>
      </div>
      <div className={css.filterItem}>
        <FieldTextInputComponent
          className={css.inputContainer}
          id="keyword"
          input={keywordField.input}
          meta={keywordField.meta}
          placeholder={intl.formatMessage({
            id: 'booker.orders.draft.resultDetailModal.keyword.placeholder',
          })}
          leftIcon={
            <div>
              <IconSearch className={css.searchIcon} />
            </div>
          }
        />
      </div>
    </form>
  );
};

export default ResultDetailFilters;
