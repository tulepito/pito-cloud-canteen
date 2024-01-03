import React, { Fragment, useCallback, useEffect } from 'react';
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
  const rootRef = React.useRef<HTMLDivElement>(null);

  const calculateStepWidth = useCallback(() => {
    const rootElem = rootRef.current;
    if (!rootElem) return;

    const rootWidth = rootElem.offsetWidth;

    const rootPaddingLeft = parseFloat(getComputedStyle(rootElem).paddingLeft);
    const rootPaddingRight = parseFloat(
      getComputedStyle(rootElem).paddingRight,
    );

    const containerChild = rootElem.children[0] as HTMLElement;

    const containerChildPaddingLeft = parseFloat(
      getComputedStyle(containerChild).paddingLeft,
    );
    const containerChildPaddingRight = parseFloat(
      getComputedStyle(containerChild).paddingRight,
    );

    const stepItems = rootElem.querySelectorAll(`.${css.stepItem}`);
    const stepConnectors = rootElem.querySelectorAll(`.${css.stepConnector}`);

    const stepItemWidth = (stepItems[0] as HTMLElement).offsetWidth;

    for (let idx = 0; idx < stepConnectors.length; idx++) {
      // Ignore the last step connector
      if (idx === stepConnectors.length - 1) break;

      const stepConnector = stepConnectors[idx] as HTMLElement;

      const remainingWidth =
        rootWidth -
        rootPaddingRight -
        rootPaddingLeft -
        containerChildPaddingLeft -
        containerChildPaddingRight;

      const w =
        (remainingWidth - stepItemWidth * steps.length) / (steps.length - 1);

      stepConnector.style.width = `${w}px`;

      const left =
        rootPaddingLeft +
        containerChildPaddingLeft +
        idx * w +
        (idx + 1) * stepItemWidth;

      stepConnector.style.left = `${left}px`;
    }
  }, [steps.length]);

  useEffect(() => {
    calculateStepWidth();
    window.addEventListener('resize', calculateStepWidth);

    return () => {
      window.removeEventListener('resize', calculateStepWidth);
    };
  }, [calculateStepWidth, steps]);

  return (
    <div className={classes} ref={rootRef}>
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
            <Fragment key={currIndex}>
              <div
                title={label}
                className={stepClasses}
                onClick={handleStepClick}>
                {currIndex}
              </div>
              {currIndex !== 0 && <div className={css.stepConnector}></div>}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
