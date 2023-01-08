import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconEmpty from '@components/Icons/IconEmpty/IconEmpty';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import arrayMutators from 'final-form-arrays';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { FormattedMessage, useIntl } from 'react-intl';

import FieldFoodSelectCheckboxGroup from './components/FieldFoodSelect/FieldFoodSelectCheckboxGroup';
import FieldFoodSelectAll from './components/FieldFoodSelectAll/FieldFoodSelectAll';
import css from './SelectFoodForm.module.scss';

const DELAY_UPDATE_TIME = 300;
const DEBOUNCE_TIME = 300;

const mapFoodOptionsFn = (item: any) => {
  const { id, attributes } = item || {};
  const { title, price } = attributes;

  return { key: id?.uuid, value: id?.uuid, title, price: price || 0 };
};

export type TSelectFoodFormValues = {
  food: string[];
  checkAll: boolean;
};

type TExtraProps = {
  formId?: string;
  errorMessage?: ReactNode;
  rootClassName?: string;
  className?: string;
  inProgress?: boolean;
  items: any[];
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
  } = props;
  const selectedFoodListLength = selectedFoodIds?.length;
  const intl = useIntl();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [currentItems, setCurrentItems] = useState(items);
  const submitDisable = selectedFoodIds?.length === 0;
  let currDebounceRef = debounceRef.current;

  const rootOptions = useMemo(() => items.map(mapFoodOptionsFn), [items]);
  const rootFoodIds = useMemo(
    () => rootOptions.map((item) => item.key),
    [rootOptions],
  );
  const currentOptions = useMemo(
    () => currentItems.map(mapFoodOptionsFn),
    [currentItems],
  );
  const currentFoodIds = useMemo(
    () => currentOptions.map((item) => item.key),
    [currentOptions],
  );
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
      const newItems = items.filter((item) =>
        item?.attributes?.title.includes(foodName),
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
            <div>{price}đ</div>
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
  }, [currentOptions.length, selectedFoodListLength, shouldCheckAll]);

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
          </div>
          <div className={css.rightPart}>
            {selectedFoodIds?.length === 0 ? (
              <div className={css.emptyIconContainer}>
                <IconEmpty />
              </div>
            ) : (
              <div>
                <div className={css.partTitle}>
                  <FormattedMessage id="SelectFoodForm.selectedFood" />
                </div>
                <div className={css.divider} />
                <div>{renderSelectedFoodList()}</div>
              </div>
            )}
            <div className={css.actionContainer}>
              <Button fullWidth disabled={submitDisable}>
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
