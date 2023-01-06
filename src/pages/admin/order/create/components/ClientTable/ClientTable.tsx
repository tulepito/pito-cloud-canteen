import Pagination from '@components/Pagination/Pagination';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './ClientTable.module.scss';

type ClientTableProps = {
  data: any[];
  totalItems: number;
  page: number;
  onPageChange: (value: number) => void;
  onItemClick?: (value: string) => () => void;
};

const ClientTable: React.FC<ClientTableProps> = (props) => {
  const { data, totalItems, onPageChange, page, onItemClick } = props;
  const intl = useIntl();
  return (
    <div className={css.container}>
      <div className={css.table}>
        <div className={css.header}>
          <span>{intl.formatMessage({ id: 'ClientTable.id' })}</span>
          <span>{intl.formatMessage({ id: 'ClientTable.companyName' })}</span>
          <span>{intl.formatMessage({ id: 'ClientTable.contact' })}</span>
          <span>{intl.formatMessage({ id: 'ClientTable.address' })}</span>
        </div>
        <div className={css.tableBody}>
          {data.map(({ key, data: itemData }, index: number) => (
            <div
              key={key}
              className={css.bodyRow}
              onClick={onItemClick && onItemClick(itemData.id)}>
              <span className={css.bodyCell}>{index + 1}</span>
              <span className={css.bodyCell}>
                <span>{itemData.companyName}</span>
              </span>
              <span className={classNames(css.bodyCell, css.phoneEmail)}>
                <div className={css.phone}>{itemData.phone}</div>
                <div className={css.email}>{itemData.email}</div>
              </span>
              <span className={css.bodyCell}>{itemData.address}</span>
            </div>
          ))}
        </div>
      </div>
      {page && (
        <Pagination
          total={totalItems}
          pageSize={10}
          current={page}
          onChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ClientTable;
