import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const onePx = 0.264583; // mm

export const createNewPrint = (id: string) => {
  const promise = new Promise((resolve, _reject) => {
    resolve({});
  });
  if (typeof window !== 'undefined' && jsPDF && html2canvas) {
    const ele = document.querySelector(`#${id}`);
    if (ele !== null && typeof ele === 'object') {
      // eslint-disable-next-line new-cap
      const doc = new jsPDF('p', 'mm', 'a7');
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      return html2canvas(
        ele as any,
        {
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          logging: true,
          letterRendering: 1,
          allowTaint: false,
          useCORS: true,
        } as any,
      ).then((canvas) => {
        const img = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(img);
        const imgWidth = imgProps.width * onePx;
        const imgHeight = imgProps.height * onePx;
        const rangeWith = width - imgWidth;
        const rangeHeight = height - imgHeight;
        const x = rangeWith < 0 ? 0 : Math.abs(width - imgWidth) / 2;
        const y = rangeHeight < 0 ? 0 : Math.abs(height - imgHeight) / 2;
        const drawWith = rangeWith < 0 ? width : imgWidth;
        const drawHeight = rangeHeight < 0 ? height : imgHeight;
        doc.addImage(img, 'PNG', x, y, drawWith, drawHeight);
        return { doc, id };
      });
    }
    return promise;
  }
  return promise;
};
