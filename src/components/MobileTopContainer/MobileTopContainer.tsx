import type { ReactNode } from 'react';
import classNames from 'classnames';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TDefaultProps } from '@src/utils/types';

import css from './MobileTopContainer.module.scss';

type TMobileTopContainerProps = TDefaultProps & {
  title: string;
  titleClassName?: string;
  titleContainerClassName?: string;
  onGoBack?: () => void;
  hasGoBackButton?: boolean;
  actionPart?: ReactNode;
};

const MobileTopContainer: React.FC<TMobileTopContainerProps> = (props) => {
  const {
    className,
    title,
    titleClassName,
    titleContainerClassName,
    hasGoBackButton,
    onGoBack,
    actionPart = null,
  } = props;

  const rootClasses = classNames(css.root, className);
  const titleContainerClasses = classNames(
    css.titleContainer,
    titleContainerClassName,
  );
  const titleClasses = classNames(css.title, titleClassName);

  return (
    <div className={rootClasses}>
      <div className={titleContainerClasses}>
        {hasGoBackButton && (
          <div className={css.goBackContainer} onClick={onGoBack}>
            <IconArrow direction="left" />
          </div>
        )}
        <div className={titleClasses}>{title}</div>
      </div>
      {actionPart}
    </div>
  );
};

export default MobileTopContainer;
