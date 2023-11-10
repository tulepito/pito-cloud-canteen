import { useRef } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

import Button from '@components/Button/Button';
import IconLightBulb from '@components/Icons/IconLightBulb/IconLightBulb';
import IconUploadFile from '@components/Icons/IconUploadFile/IconUploadFile';
import NamedLink from '@components/NamedLink/NamedLink';
import { errorToastOptions } from '@src/utils/toastify';

import css from './ImportParticipantFromFile.module.scss';

type TImportParticipantFromFileProps = {};

const ImportParticipantFromFile: React.FC<
  TImportParticipantFromFileProps
> = () => {
  const fileRef = useRef<any>(null);

  const handleClickUploadFile = () => {
    if (fileRef) {
      fileRef.current.click();
    }
  };

  const handleChangeFile = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    const files =
      e.dataTransfer && e.dataTransfer.files.length > 0
        ? [...e.dataTransfer.files]
        : [...e.target.files];

    if (files[0]) {
      e.target.value = '';

      const reader = new FileReader();
      reader.onload = (_e: any) => {
        const workbook = XLSX.read(_e?.target?.result, { type: 'array' });

        if (!workbook.SheetNames.includes('Template')) {
          toast(
            'Sai định dạng file. Vui lòng tham khảo file mẫu.',
            errorToastOptions,
          );
        }

        try {
          const worksheet = workbook.Sheets.Template;

          const data = XLSX.utils.sheet_to_json(worksheet, {
            blankrows: false,
            raw: true,
            header: 1,
          });
          console.debug('💫 > returnnewPromise > data: ', data);
        } catch (error) {
          console.error('error', error);
        }
      };
      reader.readAsArrayBuffer(files[0]!);
    }
  };

  return (
    <div className={css.root}>
      <IconLightBulb className={css.desktopLightIcon} />
      <div>
        <div className={css.importTipTitle}>
          <IconLightBulb className={css.mobileLightIcon} />
          <div>MẸO NHỎ</div>
        </div>
        <div className={css.importTipContent}>
          Bạn có thể thêm hàng loạt email bằng cách copy danh sách email và dán
          vào ô nhập email hoặc tải lên file excel. Tải file mẫu{' '}
          <strong className={css.downloadTemplateBtn}>
            <u>
              <NamedLink
                target="_blank"
                path={process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_FILE_URL}>
                tại đây
              </NamedLink>
            </u>
          </strong>
        </div>
      </div>
      <Button
        className={css.uploadFileButton}
        variant="secondary"
        onClick={handleClickUploadFile}>
        <IconUploadFile />
        <span>Tải lên file</span>
      </Button>

      <input
        id="AddParticipantForm.file"
        accept=".xlsx,.xls"
        ref={fileRef}
        onChange={handleChangeFile}
        type="file"
        className={css.inputFile}
        name="file"
      />
    </div>
  );
};

export default ImportParticipantFromFile;
