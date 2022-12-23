import classNames from 'classnames';
import React from 'react';

import css from './Table.module.scss';

export type TableHeaderProps = {
  columnList: {
    label: string;
    name: string;
  }[];
};

const TableHeader: React.FC<TableHeaderProps> = (props) => {
  const { columnList } = props;
  const columnNumber = columnList.length;
  const tableHeaderClasses = classNames(
    css.tableHeader,
    css[`column${columnNumber}`],
  );
  return (
    <thead className={tableHeaderClasses}>
      <tr>
        {columnList.map((column, index) => (
          <th key={index}>{column.label}</th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
