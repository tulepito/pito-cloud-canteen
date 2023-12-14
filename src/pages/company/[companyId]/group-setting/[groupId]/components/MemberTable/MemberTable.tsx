/* eslint-disable react-hooks/exhaustive-deps */
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconPlusBlackFill from '@components/Icons/IconPlusBlackFill/IconPlusBlackFill';
import type { TColumn, TRowData } from '@components/Table/Table';
import type { TPagination } from '@src/utils/types';

import MemberRow from '../MemberRow/MemberRow';

import css from './MemberTable.module.scss';

type TMemberTableProps = {
  MemberData: TRowData[];
  handleAddNewMember: () => void;
  onDeleteMember: (id: string, email: string) => void;
  isLoading: boolean;
  pagination?: TPagination | null;
};

const MemberTable: React.FC<TMemberTableProps> = ({
  MemberData,
  handleAddNewMember,
  isLoading,
  onDeleteMember,
}) => {
  const intl = useIntl();

  const columns: TColumn[] = [
    {
      key: 'name',
      label: intl
        .formatMessage({ id: 'MembersPage.columnLabel.name' })
        .toUpperCase(),
      render: (data: any) => {
        return <span className={css.cellNameValue}>{data.name}</span>;
      },
    },
    {
      key: 'email',
      label: intl
        .formatMessage({ id: 'MembersPage.columnLabel.email' })
        .toUpperCase(),
      render: ({ email }, _, collapseRowController) => {
        return (
          <div className={css.emailContainer}>
            <div className={css.cellValue}>
              <span>{email}</span>
            </div>
            <div className={css.iconArrowContainer}>
              <IconArrow
                direction="down"
                onClick={collapseRowController?.toggle}
                className={classNames(
                  css.iconArrow,
                  collapseRowController?.value && css.rotate,
                )}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const columnsControl: TColumn[] = [
    {
      key: 'group',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.group' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.group' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span>{data.group}</span>
          </div>
        );
      },
    },
    {
      key: 'allergy',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.allergy' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.allergy' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span className={css.cellValue}>{data.allergy}</span>
          </div>
        );
      },
    },
    {
      key: 'nutrition',
      label: intl.formatMessage({ id: 'MembersPage.columnLabel.nutrition' }),
      render: (data: any, _, collapseRowController) => {
        const { colKey } = collapseRowController ?? {};

        return colKey && colKey === 'name' ? (
          <div className={css.cellLabelValue}>
            <span>
              {intl.formatMessage({ id: 'MembersPage.columnLabel.nutrition' })}
            </span>
          </div>
        ) : (
          <div className={css.cellValue}>
            <span className={css.cellValue}>{data.nutrition}</span>
          </div>
        );
      },
    },
  ];

  return (
    <table className={css.tableContainer}>
      <thead>
        <tr className={css.headRow}>
          {columns.map((col: TColumn) => (
            <td className={css.headCell} key={col.key}>
              <span>{col.label}</span>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className={css.emptyCell}>
              Loading...
            </td>
          </tr>
        ) : MemberData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className={css.emptyCell}>
              <FormattedMessage id="Table.noResults" />
            </td>
          </tr>
        ) : (
          MemberData.map((row: TRowData) => {
            return (
              <MemberRow
                key={row.key}
                onDeleteMember={onDeleteMember}
                row={row}
                columns={columns}
                columnsControl={columnsControl}
              />
            );
          })
        )}
        <tr>
          <td colSpan={columns.length} className={css.bodyRowAddNewMembers}>
            <Button
              variant="inline"
              type="button"
              size="large"
              onClick={handleAddNewMember}
              className={css.btnPlusMember}>
              <IconPlusBlackFill className={css.iconPlus} />
              <FormattedMessage id="GroupDetail.addGroupMember" />
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default MemberTable;
