import type { PropsWithChildren } from 'react';

import css from './BookerStepperDesktopSection.module.scss';

type BookerStepperDesktopSectionProps = {};

const BookerStepperDesktopSection: React.FC<
  PropsWithChildren<BookerStepperDesktopSectionProps>
> = (props) => {
  return <div className={css.root}>{props.children}</div>;
};

export default BookerStepperDesktopSection;
