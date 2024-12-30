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

    const rootPaddingLeft = parseFloat(
      getComputedStyle(rootElem.children[0]).getPropertyValue('padding-left'),
    );
    const rootPaddingRight = parseFloat(
      getComputedStyle(rootElem.children[0]).getPropertyValue('padding-right'),
    );

    const containerChild = rootElem.children[0] as HTMLElement;

    const containerChildWidth = parseFloat(
      getComputedStyle(containerChild.children[0]).getPropertyValue('width'),
    );

    const stepConnectors = rootElem.querySelectorAll(`.${css.stepConnector}`);

    for (let idx = 0; idx < stepConnectors.length; idx++) {
      // Ignore the last step connector
      if (idx === stepConnectors.length - 1) break;

      const stepConnector = stepConnectors[idx] as HTMLElement;

      const remainingWidth = rootWidth - rootPaddingRight - rootPaddingLeft - 4;

      const w =
        (remainingWidth - containerChildWidth * steps.length) /
        (steps.length - 1);

      stepConnector.style.width = `${w}px`;

      const left =
        idx * (w + 4) + (idx + 1) * containerChildWidth + rootPaddingLeft;

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

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className={classes} ref={rootRef}>
      <div className={css.stepContainer}>
        {steps.map(({ label, onClick }, index) => {
          const currIndex = index + 1;

          const stepHeadClasses = classNames(
            css.stepItemHead,
            {
              [css.stepItemHeadActive]: currentStep >= currIndex,
            },
            stepItemClassName,
          );

          const stepLabelClasses = classNames(css.stepItemLabel, {
            [css.stepItemLabelActive]: currentStep >= currIndex,
            [css.stepItemLabelShowMobile]: currentStep === currIndex,
            [css.stepItemLabelShowMobileLeft]: currentStep === 1,
            [css.stepItemLabelShowMobileRight]: currentStep === steps.length,
          });

          const handleStepClick = () => {
            if (onClick) {
              onClick();
            }
          };

          return (
            <Fragment key={currIndex}>
              <div className={css.stepItem}>
                <div className={stepHeadClasses} onClick={handleStepClick}>
                  {currIndex}
                </div>
                <span className={stepLabelClasses}>{label}</span>
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
