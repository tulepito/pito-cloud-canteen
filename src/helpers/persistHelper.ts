export const getPersistState = (reducer: string) => {
  const rootState = JSON.parse(localStorage.getItem('persist:root') as string);

  return JSON.parse(rootState[reducer]);
};
