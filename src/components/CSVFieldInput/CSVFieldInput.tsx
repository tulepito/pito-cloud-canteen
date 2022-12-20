import { DownloadInvoice } from '@components/Icons/Icons';
import Papa from 'papaparse';

import css from './CSVFieldInput.module.scss';

type CSVFieldInputProps = {
  setData: (data: any) => void;
};

const CSVFieldInput: React.FC<CSVFieldInputProps> = ({ setData }) => {
  const onHandleChange = (event: any) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setData(results.data);
      },
    });
  };
  return (
    <div>
      <label className={css.label} htmlFor="csvReaderField">
        <DownloadInvoice className={css.downloadIcon} />
        Tai len
      </label>
      <input
        id="csvReaderField"
        type="file"
        name="csvReaderField"
        accept=".csv"
        onChange={onHandleChange}
        className={css.input}
      />
    </div>
  );
};

export default CSVFieldInput;
