export const historyPushState = (state: string, value: string | number) => {
  const url = new URL(window.location.href);
  url.searchParams.set(state.toString(), value.toString());
  window.history.pushState({}, '', url);
};
