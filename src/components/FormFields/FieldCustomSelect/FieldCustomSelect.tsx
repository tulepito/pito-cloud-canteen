import React, { useState } from 'react';
import { components } from 'react-select';
import Creatable from 'react-select/creatable';
import classNames from 'classnames';

import ValidationError from '@components/ValidationError/ValidationError';
import useBoolean from '@hooks/useBoolean';

import css from './FieldCustomSelect.module.css';

const LOADING_TIME = 500;

const convertLabelToOption = (value: string) => ({
  key: value,
  label: value,
});

type TFieldCustomSelectComponentProps = any;

const CustomMenuList = (props: any) => {
  return (
    <components.MenuList {...props} className={css.menuList}>
      {props.children}
    </components.MenuList>
  );
};

const customStyles = (selectBorderColor: any) => ({
  control: (base: any) => ({
    ...base,
    width: '100%',
    borderRadius: '8px',
    border: `1px solid ${selectBorderColor}`,
    background: '#fff',
    outline: 'none',
    '&:hover': {
      backgroundColor: '#fafafa',
    },
    '&:focus, &:target': {
      border: '2px solid #262626',
      backgroundColor: '#fafafa',
    },
    boxShadow: 'none',
    padding: '10px 12px !important',
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    '& > div': {
      padding: 0,
    },
  }),
  menu: (base: any) => ({
    ...base,
    width: 'fit-content',
    maxWidth: 'calc(100vw - 56px)',
    overflow: 'hidden auto',
  }),
  option: (base: any) => ({
    ...base,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
    width: '100%',
    wordBreak: 'break-word',
    color: '#262626',
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#fafafa',
      color: '#262626',
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: 0,
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#b2b2b2',
    fontWeight: 400,
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
  }),
  singleValue: (base: any) => ({
    ...base,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
  }),
});

const FieldCustomSelectComponent: React.FC<
  TFieldCustomSelectComponentProps
> = ({
  input,
  label,
  placeholder,
  activePlaceholder,
  options: defaultOptions,
  className,
  validateErrorClassName,
  ...rest
}) => {
  const loadingController = useBoolean();
  const focusController = useBoolean();
  const [options, setOptions] = useState(defaultOptions);
  const getOptionValue = ({ value }: any) => value;

  const onFocus = () => focusController.setTrue();
  const onBlur = () => focusController.setFalse();

  const { valid, invalid, touched, error } = rest.meta;
  const hasError = !!(touched && invalid && error);
  const selectBorderColor = hasError
    ? '#cf1322'
    : valid
    ? '#bfbfbf'
    : '#cf1322';
  const fieldMeta = { touched: hasError, error };

  const handleCreateNewOption = (inputValue: string) => {
    loadingController.setTrue();
    setTimeout(() => {
      const newOption = convertLabelToOption(inputValue);
      loadingController.setFalse();
      setOptions((prev: any) => [...prev, newOption]);
      input.onChange(newOption);
    }, LOADING_TIME);
  };

  return (
    <div className={classNames(css.selectContainer, className)}>
      {label && <label>{label}</label>}
      <Creatable
        isClearable
        createOptionPosition="first"
        onMenuOpen={onFocus}
        onMenuClose={onBlur}
        isDisabled={loadingController.value}
        isLoading={loadingController.value}
        onCreateOption={handleCreateNewOption}
        styles={customStyles(selectBorderColor)}
        hideSelectedOptions={false}
        placeholder={focusController.value ? activePlaceholder : placeholder}
        components={{
          MenuList: CustomMenuList,
          DropdownIndicator: null,
        }}
        closeMenuOnSelect
        options={options}
        {...input}
        {...rest}
        getOptionValue={getOptionValue}
      />
      <ValidationError
        fieldMeta={fieldMeta}
        className={validateErrorClassName}
      />
    </div>
  );
};

export default FieldCustomSelectComponent;
