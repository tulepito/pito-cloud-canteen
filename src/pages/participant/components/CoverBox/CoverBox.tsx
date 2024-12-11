import type { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TObject } from '@src/utils/types';

import css from './CoverBox.module.scss';

type TCoverBoxProps = {
  coverSrc: StaticImageData;
  modalTitle: string;
  modalDescription: ReactNode | string;
  rowInformation?: TObject[];
  buttonWrapper?: ReactNode;
  contentInProgress?: boolean;
  openClassName?: string;
};

const CoverBox: React.FC<TCoverBoxProps> = (props) => {
  const {
    coverSrc,
    modalTitle,
    modalDescription,
    rowInformation,
    buttonWrapper,
    contentInProgress,
  } = props;

  return (
    <div className={css.container}>
      <div className={css.contentWrapper}>
        <div className={css.coverWrapper}>
          <Image className={css.cover} src={coverSrc} alt="cover" />
        </div>
        <div
          className={css.title}
          style={{
            lineHeight: '1.4',
            fontSize: '20px',
          }}>
          {modalTitle}
        </div>
        <RenderWhen condition={!contentInProgress}>
          <>
            <div className={css.description}>{modalDescription}</div>
            <div className={css.infor}>
              {rowInformation?.map((item, index) => (
                <div className={css.row} key={index}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </>
          <RenderWhen.False>
            <Skeleton className={css.contentSkeleton} />
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <RenderWhen condition={!!buttonWrapper}>
        <div className={css.buttonWrapper}>{buttonWrapper}</div>
      </RenderWhen>
    </div>
  );
};

export default CoverBox;
