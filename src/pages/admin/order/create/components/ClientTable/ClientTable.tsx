import Pagination from '@components/Pagination/Pagination';
import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './ClientTable.module.scss';
import IconNoClientsFound from './IconNoClientsFound';

type ClientTableProps = {
  data: any[];
  totalItems: number;
  page: number;
  onPageChange: (value: number) => void;
  onItemClick?: (value: string) => () => void;
};

const ClientTable: React.FC<ClientTableProps> = (props) => {
  const intl = useIntl();
  const { data = [], totalItems, onPageChange, page, onItemClick } = props;
  const shouldShowPagination = page && data?.length > 0;

  const renderTableRowFn = ({ key, data: itemData }: any, index: number) => (
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
        <Tooltip placement="bottom" tooltipContent={itemData.email}>
          <div className={css.email}>{itemData.email}</div>
        </Tooltip>
      </span>
      <span className={css.bodyCell}>{itemData.address}</span>
    </div>
  );

  const noClientsFound = (
    <div className={css.noClientsFound}>
      <IconNoClientsFound />
      <div>
        <FormattedMessage id="ClientTable.noClientsFound" />
      </div>
    </div>
  );

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
          {data?.length > 0 ? data.map(renderTableRowFn) : noClientsFound}
        </div>
      </div>
      {shouldShowPagination && (
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
