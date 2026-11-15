/** Computes anomaly: observation minus climatological baseline mean. */
export function computeAnomaly(current: number, climatologyMean: number): number {
  return current - climatologyMean;
}

/** Computes z-score: anomaly divided by climatological standard deviation. */
export function computeZScore(
  current: number,
  climatologyMean: number,
  climatologyStd: number
): number {
  if (!Number.isFinite(climatologyStd) || climatologyStd <= 1e-6) {
    return 0;
  }
  return (current - climatologyMean) / climatologyStd;
}

/** Computes empirical percentile rank of a value within a historical distribution. */
export function computePercentileRank(value: number, series: number[]): number {
  const valid = series.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return 50;
  const countBelow = valid.filter((v) => v < value).length;
  const countEqual = valid.filter((v) => v === value).length;
  return Math.round(((countBelow + 0.5 * countEqual) / valid.length) * 100);
}

/** Calculates Ordinary Least Squares (OLS) linear trend per decade. */
export function olsTrendPerDecade(
  values: number[],
  stepYears = 1 / 12
): {
  slopePerDecade: number;
  rSquared: number;
  recordLengthYears: number;
} {
  const validIndices: number[] = [];
  const validY: number[] = [];

  values.forEach((v, idx) => {
    if (Number.isFinite(v)) {
      validIndices.push(idx);
      validY.push(v);
    }
  });

  const n = validY.length;
  if (n < 2) {
    return { slopePerDecade: 0, rSquared: 0, recordLengthYears: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;

  for (let i = 0; i < n; i++) {
    const x = validIndices[i] * stepYears;
    const y = validY[i];
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumXY += x * y;
  }

  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    return { slopePerDecade: 0, rSquared: 0, recordLengthYears: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const x = validIndices[i] * stepYears;
    const y = validY[i];
    const yHat = intercept + slope * x;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - yHat) ** 2;
  }

  const rSquared = ssTot > 1e-12 ? Math.max(0, 1 - ssRes / ssTot) : 1;
  const totalSpanYears = (values.length - 1) * stepYears;

  return {
    slopePerDecade: slope * 10,
    rSquared,
    recordLengthYears: Math.max(0.1, totalSpanYears),
  };
}

/** Arithmetic mean of array values. */
export function mean(arr: number[]): number {
  const valid = arr.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return NaN;
  return valid.reduce((acc, v) => acc + v, 0) / valid.length;
}

/** Sample standard deviation. */
export function stdDev(arr: number[]): number {
  const valid = arr.filter((v) => Number.isFinite(v));
  if (valid.length < 2) return 0;
  const m = mean(valid);
  const variance =
    valid.reduce((acc, v) => acc + (v - m) ** 2, 0) / (valid.length - 1);
  return Math.sqrt(variance);
}
