import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@components/Button/Button';
import IconPlusBlackFill from '@components/Icons/IconPlusBlackFill/IconPlusBlackFill';
import type { TColumn, TRowData } from '@components/Table/Table';
import type { TDefaultProps } from '@utils/types';

import css from './GroupSettingTable.module.scss';

type TGroupSettingTableProps = TDefaultProps & {
  columns: TColumn[];
  data: TRowData[];
  isLoading?: boolean;
  handleOpenCreateGroupModal: () => void;
};

const GroupSettingTable = (props: TGroupSettingTableProps) => {
  const {
    columns = [],
    data = [],
    isLoading,
    handleOpenCreateGroupModal,
  } = props;

  return (
    <table className={css.table}>
      <thead>
        <tr className={css.headRow}>
          {columns.map((col: TColumn) => (
            <td className={css.headCell} key={col.key}>
              <span>{col.label}</span>
            </td>
          ))}
        </tr>
      </thead>
      {isLoading ? (
        <tbody>
          <tr>
            <td colSpan={columns.length} className={css.emptyCell}>
              Loading...
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody>
          {data.map((row: TRowData) => (
            <tr className={css.bodyRow} key={row.key}>
              {columns.map((col: TColumn) => {
                return (
                  <td
                    className={css.bodyCell}
                    data-label={col.label}
                    key={col.key}>
                    {col.render(row.data, true)}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr key="addGroup">
            <td
              colSpan={columns.length}
              className={css.bodyCell}
              data-label="addGroup"
              key="addGroup">
              <Button
                variant="inline"
                type="button"
                size="large"
                onClick={handleOpenCreateGroupModal}
                className={css.btnGroup}>
                <IconPlusBlackFill className={css.iconPlus} />
                <FormattedMessage id="GroupSetting.pageTitle" />
              </Button>
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

export default GroupSettingTable;
