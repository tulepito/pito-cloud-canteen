import { useEffect, useState } from 'react';
import classNames from 'classnames';

import {
  AFTERNOON_SESSION,
  EVENING_SESSION,
  MORNING_SESSION,
} from '@components/CalendarDashboard/helpers/constant';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TObject } from '@src/utils/types';

import css from './DaySessionField.module.scss';

type DaySessionFieldProps = {
  containerClassName?: string;
  titleClassName?: string;
  fieldGroupClassName?: string;
  form: any;
  values: TObject;
  disabled?: boolean;
};
const daySessionOptions = [
  {
    key: MORNING_SESSION,
    label: 'Bữa sáng',
  },
  {
    key: AFTERNOON_SESSION,
    label: 'Bữa trưa',
  },
  {
    key: EVENING_SESSION,
    label: 'Bữa tối',
  },
];
const DaySessionField: React.FC<DaySessionFieldProps> = (props) => {
  const {
    containerClassName,
    titleClassName,
    fieldGroupClassName,
    form,
    values,
    disabled = false,
  } = props;
  const { daySession = '' } = values;
  const [selectedSession, setSelectedSession] = useState<string>(daySession);
  const containerClasses = classNames(css.container, containerClassName);

  const titleClasses = classNames(css.title, titleClassName);
  const fieldGroupsClasses = classNames(css.fieldGroups, fieldGroupClassName);
  useEffect(() => {
    form.change('daySession', selectedSession);
  }, [form, selectedSession]);

  return (
    <div className={containerClasses}>
      <div className={titleClasses}>Chọn bữa ăn</div>
      <FieldTextInput
        id="daySession"
        name="daySession"
        type="hidden"
        disabled={disabled}
      />
      <div className={fieldGroupsClasses}>
        {daySessionOptions.map(({ key, label }) => {
          const onSessionSelect = () => {
            if (disabled) return;

            setSelectedSession(key);
          };

          return (
            <div
              key={key}
              className={classNames(css.dayItem, {
                [css.selected]: selectedSession === key,
                [css.disabled]: disabled,
              })}
              onClick={onSessionSelect}>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DaySessionField;
