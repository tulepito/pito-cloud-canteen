/* eslint-disable react-hooks/rules-of-hooks */
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { FormattedMessage, useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import { addCommas } from '@helpers/format';
import { toNonAccentVietnamese } from '@src/utils/string';
import type { TDefaultProps } from '@utils/types';

import FieldFoodSelectCheckboxGroup from './components/FieldFoodSelect/FieldFoodSelectCheckboxGroup';
import FieldFoodSelectAll from './components/FieldFoodSelectAll/FieldFoodSelectAll';

import css from './SelectFoodForm.module.scss';

const DELAY_UPDATE_TIME = 300;
const DEBOUNCE_TIME = 300;

const normalizeItems = (items: any[]) => {
  return items.map((item) => {
    const { id, attributes } = item || {};
    const { title, price } = attributes;
    const nonAccentTitle = toNonAccentVietnamese(title, true);

    return { id: id?.uuid, title, nonAccentTitle, price: price || 0 };
  });
};

const mapFoodOptionsFn = (item: any) => {
  const { id, title, price, nonAccentTitle } = item || {};

  return { key: id, value: id, title, price, nonAccentTitle };
};

const generateOptionsFormItems = (items: any[]) => {
  return useMemo(() => items.map(mapFoodOptionsFn), [items]);
};

const generateIdsFromOptions = (options: any[]) => {
  return useMemo(() => options.map((item) => item.key), [options]);
};

export type TSelectFoodFormValues = {
  food: string[];
  checkAll: boolean;
};

type TExtraProps = TDefaultProps & {
  formId?: string;
  errorMessage?: ReactNode;
  inProgress?: boolean;
  items: any[];
  selectFoodInProgress?: boolean;
  handleFormChange: (food: string[] | undefined) => void;
};
type TSelectFoodFormProps = FormProps<TSelectFoodFormValues> & TExtraProps;
type TSelectFoodFormComponentProps = FormRenderProps<TSelectFoodFormValues> &
  Partial<TExtraProps>;

const SelectFoodFormComponent: React.FC<TSelectFoodFormComponentProps> = (
  props,
) => {
  const {
    formId,
    handleSubmit,
    items = [],
    values: { food: selectedFoodIds = [] },
    form,
    handleFormChange,
    selectFoodInProgress,
  } = props;
  const selectedFoodListLength = selectedFoodIds?.length;
  const intl = useIntl();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const normalizedItems = normalizeItems(items);
  const [currentItems, setCurrentItems] = useState(normalizedItems);
  const submitDisable = selectedFoodIds?.length === 0;
  let currDebounceRef = debounceRef.current;

  const rootOptions = generateOptionsFormItems(normalizedItems);
  const rootFoodIds = generateIdsFromOptions(rootOptions);
  const currentOptions = generateOptionsFormItems(currentItems);
  const currentFoodIds = generateIdsFromOptions(currentOptions);

  const shouldCheckAll = currentFoodIds.every((id) =>
    selectedFoodIds.includes(id),
  );

  const handleRemoveFood = (foodId: string) => () => {
    const newFoodList = selectedFoodIds.filter((id) => id !== foodId);

    form.change('food', newFoodList);
  };

  const selectedFoodList = selectedFoodIds
    .map((foodId) => {
      return rootOptions.find((option) => foodId === option.key);
    })
    .filter((item) => item);

  const handleCheckAllFieldChange = (event: any) => {
    let newFoodList: string[] = [];
    const newCheckAllValue = event.target.checked;

    form.change('checkAll', newCheckAllValue);

    if (newCheckAllValue) {
      newFoodList = rootFoodIds.reduce((result, id) => {
        if (selectedFoodIds.includes(id) || currentFoodIds.includes(id)) {
          return [...result, id];
        }

        return result;
      }, []);
    } else {
      newFoodList = selectedFoodIds.filter(
        (id) => !currentFoodIds.includes(id),
      );
    }

    setTimeout(() => form.change('food', newFoodList), DELAY_UPDATE_TIME);
  };

  const handleSearchFoodWithDebounce = (foodName: string) => {
    if (currDebounceRef) {
      clearTimeout(currDebounceRef);
    }

    currDebounceRef = setTimeout(() => {
      const newItems = normalizedItems.filter((item) =>
        item.nonAccentTitle.includes(toNonAccentVietnamese(foodName, true)),
      );

      setCurrentItems(newItems);
    }, DEBOUNCE_TIME);
  };

  const renderSelectedFoodList = () =>
    selectedFoodList.map((foodItem) => {
      const { key, title, price } = foodItem || {};

      return (
        <div key={key} className={css.selectFoodItem}>
          <div className={css.deleteIconBox} onClick={handleRemoveFood(key)}>
            <IconClose className={css.deleteIcon} />
          </div>
          <div className={css.titleContainer}>
            <div className={css.title}>{title}</div>
            <div>{addCommas(price.amount)}đ</div>
          </div>
        </div>
      );
    });

  useEffect(() => {
    if (
      currentOptions.length === 0 ||
      selectedFoodListLength === 0 ||
      !shouldCheckAll
    ) {
      form.change('checkAll', false);
    } else {
      form.change('checkAll', true);
    }
  }, [currentOptions.length, form, selectedFoodListLength, shouldCheckAll]);

  return (
    <Form onSubmit={handleSubmit}>
      <OnChange name="food">{handleFormChange}</OnChange>
      <div className={css.formContainer}>
        <div className={css.searchInputContainer}>
          <FieldTextInput
            name="name"
            leftIcon={<IconSearch />}
            placeholder={intl.formatMessage({
              id: 'SelectFoodForm.findFoodByName',
            })}
          />
          <OnChange name="name">{handleSearchFoodWithDebounce}</OnChange>
        </div>
        <div className={css.contentContainer}>
          <div className={css.leftPart}>
            {currentOptions.length === 0 ? (
              <div className={css.noResult}>
                <FormattedMessage id="SelectFoodForm.noFoodOption" />
              </div>
            ) : (
              <div>
                <FieldFoodSelectAll
                  id={`${formId}.food.checkAll`}
                  customOnChange={handleCheckAllFieldChange}
                  name="checkAll"
                />
                <FieldFoodSelectCheckboxGroup
                  id="food"
                  name="food"
                  options={currentOptions}
                />
              </div>
            )}
          </div>
          <div className={css.rightPart}>
            {selectedFoodIds?.length === 0 ? (
              <div className={css.emptyIconContainer}>
                <IconEmpty />
                <div className={css.noSelectedItemsText}>
                  <FormattedMessage id="SelectFoodForm.noSelectedItems" />
                </div>
              </div>
            ) : (
              <div>
                <div className={css.partTitle}>
                  <FormattedMessage id="SelectFoodForm.selectedFood" />
                </div>
                <div className={css.divider} />
                <div className={css.itemContainer}>
                  {renderSelectedFoodList()}
                </div>
              </div>
            )}
            <div className={css.actionContainer}>
              <Button
                fullWidth
                disabled={submitDisable}
                inProgress={selectFoodInProgress}>
                <FormattedMessage id="SelectFoodForm.saveResult" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

const SelectFoodForm: React.FC<TSelectFoodFormProps> = (props) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={SelectFoodFormComponent}
    />
  );
};

export default SelectFoodForm;
