/* eslint-disable no-await-in-loop */
/* eslint-disable new-cap */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// calculate the desired page size
const pageWidth = 595; // A4 width in pixels
const pageHeight = 842; // A4 height in pixels
const paddingTop = 23; // padding top in pixels
const paddingBottom = 53; // padding bottom in pixels
// const contentWidth = pageWidth;
const contentHeight = pageHeight - paddingTop - paddingBottom;

type TCreateNewPrintParams = {
  id: string;
};

export const createNewPrint = async ({ id }: TCreateNewPrintParams) => {
  if (typeof window !== 'undefined' && jsPDF && html2canvas) {
    const component = document.querySelector(`#${id}`) as any;

    if (component !== null && typeof component === 'object') {
      // get the component's bounding box
      const boundingBox = component.getBoundingClientRect();

      // calculate the number of pages needed
      const totalPages = Math.ceil(boundingBox.height / contentHeight);

      // create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      // loop through each page
      for (let i = 0; i < totalPages; i++) {
        // capture a screenshot of the component for the current page
        const canvas = await html2canvas(component, {
          scale: 1,
          width: pageWidth,
          height: contentHeight,
          x: 0,
          y: i * contentHeight,
        });

        // convert the screenshot to an image
        const imageData = canvas.toDataURL('image/png');

        // add the image to the PDF document
        /* addImage explained below:
              param 1 -> image in code format
              param 2 -> type of the image. SVG not supported. needs to be either PNG or JPEG.
              all params are specified in integer
              param 3 -> X axis margin from left
              param 4 -> Y axis margin from top
              param 5 -> width of the image
              param 6 -> height of the image
          */

        const imgProps = doc.getImageProperties(imageData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          imageData,
          'PNG',
          0,
          paddingTop,
          pdfWidth,
          pdfHeight,
          '',
          'FAST',
        );

        // add a new page to the PDF document if there are more pages
        if (i < totalPages - 1) {
          doc.addPage();
        }
      }

      return { doc, id };
    }

    return { doc: null, id: null };
  }

  return { doc: null, id: null };
};
