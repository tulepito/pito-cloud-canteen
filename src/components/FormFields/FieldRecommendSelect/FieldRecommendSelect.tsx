import { type FieldRenderProps, Field } from 'react-final-form';
import Select, { components } from 'react-select';

import IconSearch from '@components/Icons/IconSearch/IconSearch';
import useBoolean from '@hooks/useBoolean';

import css from './FieldRecommendSelect.module.scss';

type FieldRecommendSelectProps = FieldRenderProps<string, any> & {
  options: {
    key: string;
    label: string;
  }[];
};

export const FieldRecommendSelectComponent = (
  props: FieldRecommendSelectProps,
) => {
  const { options, input, placeholder, inputRef } = props;
  const focusController = useBoolean();
  const { id, name, onChange } = input;

  const onCustomChange = (value: any) => {
    onChange(value);
    focusController.setFalse();
  };

  const onFocus = () => focusController.setTrue();
  const onBlur = () => focusController.setFalse();
  const customStyles = {
    control: (base: any) => ({
      ...base,
      width: '100%',
      borderRadius: '8px',
      border: '1px solid #bfbfbf',
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
      minHeight: 44,
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
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
    }),
  };

  const SearchIcon = ({ children, ...rest }: any) => (
    <components.ValueContainer {...rest}>
      <div className={css.searchContainer}>
        <IconSearch />
        {children}
      </div>
    </components.ValueContainer>
  );

  return (
    <Select
      styles={customStyles}
      options={options}
      id={id}
      name={name}
      onMenuOpen={onFocus}
      onMenuClose={onBlur}
      placeholder={placeholder}
      components={{ ValueContainer: SearchIcon }}
      onChange={onCustomChange}
      ref={inputRef}
    />
  );
};

const FieldRecommendSelect = (props: any) => {
  return <Field component={FieldRecommendSelectComponent} {...props} />;
};

export default FieldRecommendSelect;
