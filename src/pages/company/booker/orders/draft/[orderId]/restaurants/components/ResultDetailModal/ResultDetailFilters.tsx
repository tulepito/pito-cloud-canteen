/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import { IconCheckbox } from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconSearch from '@components/Icons/IconSearch/IconSearch';

import css from './ResultDetailModal.module.scss';

type TResultDetailFiltersProps = {
  selectedFoodIds: string[];
  originFoodIdList: string[];
  initialValues?: TResultDetailFiltersValues;
  onSelectAllFood?: (foodIds: string[]) => void;
  onSearchSubmit?: (values: string) => void;
};

export type TResultDetailFiltersValues = {
  keyword?: string;
  selectAll?: boolean;
};

const ResultDetailFilters: React.FC<TResultDetailFiltersProps> = ({
  selectedFoodIds,
  originFoodIdList,
  initialValues,
  onSelectAllFood = () => null,
  onSearchSubmit,
}) => {
  const intl = useIntl();

  const handleSearch = (values: TResultDetailFiltersValues) => {
    onSearchSubmit?.(values.keyword!);
  };

  const { form, handleSubmit } = useForm<TResultDetailFiltersValues>({
    onSubmit: handleSearch,
    initialValues,
  });

  const selectAllField = useField('selectAll', form);
  const keywordField = useField('keyword', form);

  useEffect(() => {
    if (selectAllField.input.value && originFoodIdList.length !== 0) {
      onSelectAllFood(originFoodIdList);
    }
  }, [originFoodIdList, selectAllField.input.value]);

  useEffect(() => {
    if (
      selectedFoodIds.length === originFoodIdList.length &&
      originFoodIdList.length !== 0
    ) {
      form.change('selectAll', true);
    } else if (
      selectedFoodIds.length !== originFoodIdList.length &&
      originFoodIdList.length !== 0
    ) {
      form.change('selectAll', false);
    }
  }, [JSON.stringify(selectedFoodIds), JSON.stringify(originFoodIdList)]);

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
