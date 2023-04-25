import type { ReactNode } from 'react';

import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './FixedBottomButtons.module.scss';

type FixedBottomButtonsProps = {
  FirstButton: ReactNode;
  SecondButton?: ReactNode;
  separator?: ReactNode;
};

const FixedBottomButtons: React.FC<FixedBottomButtonsProps> = (props) => {
  const { FirstButton, SecondButton, separator } = props;

  return (
    <div className={css.fixedBottomWrapper}>
      {FirstButton}
      <RenderWhen condition={!!separator}>{separator}</RenderWhen>
      <RenderWhen condition={!!SecondButton}>{SecondButton}</RenderWhen>
    </div>
  );
};

export default FixedBottomButtons;
