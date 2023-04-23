import type { TDefaultProps, TObject } from '@utils/types';

export type TTimeLineItemData = TObject;
export type TTimeLineItemProps = TDefaultProps & {
  data: TTimeLineItemData;
  isAdminLayout?: boolean;
};

export type TTimeLineProps = TDefaultProps & {
  items: TTimeLineItemData[];
  itemComponent: React.FC<TTimeLineItemProps>;
  itemClassName?: string;
  isAdminLayout?: boolean;
};
