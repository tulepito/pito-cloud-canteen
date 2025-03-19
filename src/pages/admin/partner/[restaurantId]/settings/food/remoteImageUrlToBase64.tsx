export const remoteImageUrlToBase64 = async (url: string): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CANONICAL_URL}/api/remote-image-to-base64?url=${url}`,
  );
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
