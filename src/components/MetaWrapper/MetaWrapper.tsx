import { type PropsWithChildren, useEffect } from 'react';
import { useIntl } from 'react-intl';

import type { TMetaProps } from '@components/Layout/Meta';
import Meta from '@components/Layout/Meta';
import Gleap from '@src/utils/gleap';

type TMetaWrapperProps = PropsWithChildren<
  TMetaProps & {
    routeName?: string;
    titleId?: string;
    title?: string;
    descriptionId?: string;
    description?: string;
  }
>;

const MetaWrapper: React.FC<TMetaWrapperProps> = ({
  routeName,
  children,
  title,
  titleId,
  description,
  descriptionId,
}) => {
  const intl = useIntl();

  useEffect(() => {
    if (window.innerWidth < 768) {
      Gleap.hideButton();
    }
  }, []);

  const metaProps = {
    title:
      title ||
      (titleId &&
        intl.formatMessage({
          id: titleId,
        })) ||
      (routeName &&
        intl.formatMessage({
          id: `${routeName}.title`,
        })),
    description:
      description ||
      (descriptionId &&
        intl.formatMessage({
          id: descriptionId,
        })) ||
      (routeName &&
        intl.formatMessage({
          id: `${routeName}.description`,
        })),
  };

  return (
    <>
      <Meta {...metaProps} />
      {children}
    </>
  );
};

export default MetaWrapper;
