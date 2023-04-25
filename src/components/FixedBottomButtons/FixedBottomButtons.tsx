import type { ReactNode } from 'react';

import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './FixedBottomButtons.module.scss';

type FixedBottomButtonsProps = {
  FirstButton: ReactNode;
  SecondButton?: ReactNode;
  separator?: ReactNode;
  isAbsolute?: boolean;
};

const FixedBottomButtons: React.FC<FixedBottomButtonsProps> = (props) => {
  const { FirstButton, SecondButton, separator, isAbsolute = false } = props;
  const classes = isAbsolute ? css.absoluteWrapper : css.fixedBottomWrapper;

  return (
    <div className={classes}>
      {FirstButton}
      <RenderWhen condition={!!separator}>{separator}</RenderWhen>
      <RenderWhen condition={!!SecondButton}>{SecondButton}</RenderWhen>
    </div>
  );
};

export default FixedBottomButtons;
