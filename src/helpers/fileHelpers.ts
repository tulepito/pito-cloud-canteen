class FileHelpers {
  static COMPRESSED_FIXED_IMAGE_WIDTH = 1024;

  static compressImage = (file: File) => {
    if (!file) {
      return Promise.reject(new Error('File is null'));
    }

    const isImageFile = file.type.match(/image.*/);
    if (!isImageFile) {
      return Promise.reject(new Error('File is not an image'));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const elem = document.createElement('canvas');

          const width = FileHelpers.COMPRESSED_FIXED_IMAGE_WIDTH;
          const scaleFactor = width / img.width;
          elem.width = width;
          elem.height = img.height * scaleFactor;

          const ctx = elem.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, img.height * scaleFactor);
          ctx?.canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob!], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            1,
          );
        };

        img.onerror = (error) => reject(error);
      };
    });
  };
}

export default FileHelpers;
