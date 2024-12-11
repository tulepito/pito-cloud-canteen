const SessionSotrageHelper = {
  keys: {
    'flag:prevent-resetting-user-role': 'flag:prevent-resetting-user-role',
  },
  setItem(key: string, value: any) {
    return sessionStorage.setItem(key, value);
  },
  getItem(key: string) {
    return sessionStorage.getItem(key);
  },
  removeItem(key: string) {
    return sessionStorage.removeItem(key);
  },
};

export default SessionSotrageHelper;
