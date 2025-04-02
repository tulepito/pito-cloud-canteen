export const remoteImageUrlToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CANONICAL_URL}/api/remote-image-to-base64?url=${url}`,
  );
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (
        typeof reader.result === 'string' &&
        reader.result.startsWith('data:image')
      ) {
        resolve(reader.result);
      } else {
        reject(new Error('Invalid image format'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
