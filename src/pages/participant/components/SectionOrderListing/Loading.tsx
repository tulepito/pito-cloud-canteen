import Skeleton from 'react-loading-skeleton';
import css from './SectionOrderListing.module.scss';

export const listingLoading = () => [
  {
    label: <Skeleton className={css.loadTitle} />,
    id: 'Loading...',
    children: [1, 2, 3].map((item) => (
      <Skeleton key={item} className={css.loading} />
    )),
  },
  {
    label: <Skeleton className={css.loadTitle} />,
    id: 'Loading...',
    children: [1, 2, 3].map((item) => (
      <Skeleton key={item} className={css.loading} />
    )),
  },
  {
    label: <Skeleton className={css.loadTitle} />,
    id: 'Loading...',
    children: [1, 2, 3].map((item) => (
      <Skeleton key={item} className={css.loading} />
    )),
  },
];
