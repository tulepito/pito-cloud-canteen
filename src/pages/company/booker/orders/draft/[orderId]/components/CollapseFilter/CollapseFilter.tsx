import classNames from 'classnames';

import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import useBoolean from '@hooks/useBoolean';

import css from './CollapseFilter.module.scss';

type CollapseFilterProps = {
  title: string;
  name: string;
  options: any[];
};

const CollapseFilter: React.FC<CollapseFilterProps> = (props) => {
  const { title, options = [], name } = props;
  const { value: isOptionsCollapse, toggle: toggleOptionsCollapse } =
    useBoolean(false);

  const optionsClasses = classNames(css.optionsContainer, {
    [css.collapse]: isOptionsCollapse,
  });

  const iconClasses = classNames(css.directIcon, {
    [css.collapse]: isOptionsCollapse,
  });

  return (
    <div className={css.wrapper}>
      <div className={css.header}>
        <div className={css.title}>{title}</div>
        <div onClick={toggleOptionsCollapse}>
          <IconArrow direction="up" className={iconClasses} />
        </div>
      </div>
      <div className={optionsClasses}>
        {options.map(({ key, label }) => (
          <FieldCheckbox
            id={`${name}-${key}`}
            key={`${name}-${key}`}
            name={name}
            value={key}
            label={label}
          />
        ))}
      </div>
    </div>
  );
};

export default CollapseFilter;
