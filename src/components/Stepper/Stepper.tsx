import classNames from 'classnames';

import type { TDefaultProps } from '@src/utils/types';

import css from './Stepper.module.scss';

export type StepperItem = {
  label: string;
  onClick?: () => void;
};

type TStepperProps = TDefaultProps & {
  steps: StepperItem[];
  currentStep: number;
  stepItemClassName?: string;
};

const Stepper: React.FC<TStepperProps> = ({
  className,
  steps,
  currentStep = 1,
  stepItemClassName,
}) => {
  const classes = classNames(css.root, className);

  return (
    <div className={classes}>
      <div className={css.stepContainer}>
        {steps.map(({ label, onClick }, index) => {
          const currIndex = index + 1;

          const stepClasses = classNames(
            css.stepItem,
            {
              [css.stepItemActive]: currentStep >= currIndex,
            },
            stepItemClassName,
          );

          const handleStepClick = () => {
            if (onClick) {
              onClick();
            }
          };

          return (
            <div
              key={currIndex}
              title={label}
              className={stepClasses}
              onClick={handleStepClick}>
              {currIndex}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
