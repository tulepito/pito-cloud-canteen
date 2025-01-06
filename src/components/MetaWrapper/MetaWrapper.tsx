import { type PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';

import type { TMetaProps } from '@components/Layout/Meta';
import Meta from '@components/Layout/Meta';

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
