import Pagination from '@components/Pagination/Pagination';
import type { TPagination } from '@utils/types';
import classNames from 'classnames';

import css from './ClientTable.module.scss';

type ClientTableProps = {
  data: any[];
  pagination?: TPagination | null;
  onPageChange: (value: number) => void;
};

const ClientTable: React.FC<ClientTableProps> = (props) => {
  const { data, pagination, onPageChange } = props;
  const { page, totalItems } = pagination || {};
  return (
    <div className={css.container}>
      <div className={css.table}>
        <div className={css.header}>
          <span>ID</span>
          <span>Ho va ten</span>
          <span>Lien he</span>
          <span>Dia chi</span>
        </div>
        <div className={css.tableBody}>
          {data.map(({ key, data: itemData }, index: number) => (
            <div key={key} className={css.bodyRow}>
              <span className={css.bodyCell}>{index}</span>
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
      {pagination && (
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
