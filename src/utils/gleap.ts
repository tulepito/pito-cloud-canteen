declare global {
  interface Window {
    Gleap: {
      open: () => void;
    };
  }
}

class Gleap {
  static openChat() {
    if (window && window.Gleap) {
      window.Gleap.open();
    }
  }
}

export default Gleap;
