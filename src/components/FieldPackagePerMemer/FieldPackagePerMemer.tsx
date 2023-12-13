import { useRef, useState } from 'react';
import { useField } from 'react-final-form-hooks';
import classNames from 'classnames';
import type { FormApi } from 'final-form';
import Tooltip from 'rc-tooltip';

import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import {
  addCommas,
  parseThousandNumber as parseThousandNumberHelper,
  removeNonNumeric,
} from '@helpers/format';

import css from './FieldPackagePerMemer.module.scss';

const VNDIcon = () => {
  return <div className={css.vndIcon}>đ</div>;
};

function createOptions({
  min = 40000,
  max = 80000,
  gap = 5000,
}: {
  min?: number;
  max?: number;
  gap?: number;
} = {}) {
  const options = [];
  for (let i = min; i <= max; i += gap) {
    options.push(i);
  }

  return options;
}

interface UnitBudgetInputPopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onOptionChange: (value: number) => void;
}

function UnitBudgetInputPopoverContent(
  props: UnitBudgetInputPopoverContentProps,
) {
  const options = createOptions({
    min: 40000,
    max: 80000,
    gap: 5000,
  });

  return (
    <div className={css.dropdownWrapper} {...props}>
      {[...options, 0].map((option) => (
        <div
          key={option}
          className={css.dropdownItem}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => props.onOptionChange(option)}>
          {option === 0 ? (
            'Ngân sách khác'
          ) : (
            <>{parseThousandNumberHelper(option)}đ</>
          )}
        </div>
      ))}
    </div>
  );
}

type FormType = FormApi<any, Partial<any>>;

interface FieldPackagePerMemerProps {
  form: FormType;
  className?: string;
  tooltipOverlayClassName?: string;
  id: string;
  name: string;
  label: string;
  placeholder: string;
}

function FieldPackagePerMemer({
  form,
  className,
  tooltipOverlayClassName,
  ...rest
}: FieldPackagePerMemerProps) {
  const [isOptionsShowed, setIsOptionsShowed] = useState(false);
  const packagePerMember = useField('packagePerMember', form);

  const inputRef = useRef<HTMLInputElement>(null);

  const parseThousandNumber = (value: string) => {
    return addCommas(removeNonNumeric(value));
  };

  const onUnitBudgetInputOptionChange = (value: number): void => {
    form.batch(() => {
      form.change('packagePerMember', parseThousandNumber(String(value || '')));
      if (!value) {
        // reset field state to prevent validation error
        form.resetFieldState('packagePerMember');
      }
    });

    if (inputRef.current) {
      inputRef.current.focus();
    }

    setIsOptionsShowed(false);
  };

  const inputClassNames = classNames(css.numberInput, className);

  const tooltipOverlayClassNames = classNames(
    css.tooltipOverlay,
    tooltipOverlayClassName,
  );

  return (
    <Tooltip
      overlay={
        <UnitBudgetInputPopoverContent
          onOptionChange={onUnitBudgetInputOptionChange}
        />
      }
      placement="bottomLeft"
      showArrow={false}
      visible={isOptionsShowed}
      overlayStyle={{ opacity: 1 }}
      overlayClassName={tooltipOverlayClassNames}
      overlayInnerStyle={{ backgroundColor: '#fff', padding: 0, opacity: 1 }}>
      <FieldTextInputComponent
        inputRef={inputRef}
        autoComplete="off"
        input={packagePerMember.input}
        meta={packagePerMember.meta}
        type="text"
        className={inputClassNames}
        rightIcon={<VNDIcon />}
        onFocus={() => setIsOptionsShowed(true)}
        onClick={() => setIsOptionsShowed(true)}
        customOnBlur={() => setIsOptionsShowed(false)}
        onKeyDown={(event: any) => {
          const ENTER_KEY_CODE = 13;
          if (event.keyCode === ENTER_KEY_CODE) {
            setIsOptionsShowed(false);
          }
        }}
        onChange={(event: any) => {
          setIsOptionsShowed(true);
          const { value } = event.target;
          form.change('packagePerMember', value);
        }}
        {...rest}
      />
    </Tooltip>
  );
}

export default FieldPackagePerMemer;
