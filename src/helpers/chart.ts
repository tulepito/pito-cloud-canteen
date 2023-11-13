export const formatAxisTickValue = (value: number) => {
  if (value >= 1000000000) {
    return `${Math.round(value / 1000000000)}t`;
  }
  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}tr`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}n`;
  }

  return `${value}`;
};

// Greatest Common Divisor (GCD) via Euclidean Algorithm
export const calculateGCD = (a: number, b: number): number => {
  if (b === 0) {
    return a;
  }

  return calculateGCD(b, a % b);
};

// Least Common Multiple (LCM) via GCD
export const calculateLCM = (a: number, b: number): number => {
  return (a * b) / calculateGCD(a, b);
};
