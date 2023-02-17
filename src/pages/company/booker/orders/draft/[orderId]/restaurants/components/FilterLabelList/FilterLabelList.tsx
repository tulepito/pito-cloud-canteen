import IconClose from '@components/Icons/IconClose/IconClose';

import css from './FilterLabelList.module.scss';

type FilterLabelListProps = {
  filterLabels: {
    filter: string;
    value: string;
    label?: string;
  }[];
  onFilterLabelRemove?: (filter: string, value: string) => void;
};

const FilterLabelList: React.FC<FilterLabelListProps> = (props) => {
  const { filterLabels, onFilterLabelRemove } = props;
  return (
    <div className={css.container}>
      {filterLabels.map(({ filter, value, label }) => (
        <div key={`${filter}-${value}-${label}`} className={css.filterLabel}>
          <span>{label}</span>
          <IconClose
            className={css.closeIcon}
            onClick={onFilterLabelRemove?.bind(null, filter, value)}
          />
        </div>
      ))}
    </div>
  );
};

export default FilterLabelList;
