import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import React, { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import css from './ResultDetailModal.module.scss';

type TResultDetailFiltersProps = {
  onSelectAll: (value: boolean) => void;
  initialValues?: TResultDetailFiltersValues;
};

export type TResultDetailFiltersValues = {
  isSelectAll?: boolean;
  keyword?: string;
};

const ResultDetailFilters: React.FC<TResultDetailFiltersProps> = ({
  onSelectAll,
  initialValues,
}) => {
  const intl = useIntl();

  const handleSearch = () => {
    console.log('submit');
  };

  const { form, handleSubmit } = useForm<TResultDetailFiltersValues>({
    onSubmit: handleSearch,
  });

  const selectAllField = useField('selectAll', form);
  const keywordField = useField('keyword', form);

  useEffect(() => {
    onSelectAll(selectAllField.input.value);
  }, [selectAllField.input.value, onSelectAll]);

  return (
    <form onSubmit={handleSubmit} className={css.filters}>
      <div className={css.filterItem}>
        <div className={css.checbox}>
          <input
            className={css.input}
            id={'selectAll'}
            type="checkbox"
            {...selectAllField.input}
            checked={initialValues?.isSelectAll}
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
