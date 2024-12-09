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

  static hideButton() {
    const gleapButton = document.querySelector(
      '.bb-feedback-button',
    ) as HTMLElement;
    if (gleapButton) {
      gleapButton.style.display = 'none';
    }
  }
}

export default Gleap;
