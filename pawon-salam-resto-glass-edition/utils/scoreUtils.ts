
export const getScoreLabel = (score: number): string => {
  if (score >= 4.5) return 'Sangat Baik';
  if (score >= 3.5) return 'Baik';
  if (score >= 2.5) return 'Cukup';
  if (score >= 1.5) return 'Kurang';
  return 'Sangat Kurang';
};

export const getScoreColor = (score: number): string => {
  if (score >= 4.0) return '#22c55e'; // Green
  if (score >= 3.0) return '#E87722'; // Brand Orange (Fair/Good)
  return '#ef4444'; // Red
};

export const computeOverallScore = (scores: Record<string, number>): number => {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / values.length).toFixed(1));
};