export const historyPushState = (state: string, value: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set(state.toString(), value.toString());
  window.history.pushState({}, '', url);
};

export const parseLocationSearchToObject = () => {
  const search = window?.location?.search?.slice(1);

  return JSON.parse(
    `{"${decodeURI(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')}"}`,
  );
};
