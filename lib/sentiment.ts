import Sentiment from 'sentiment';

export type Emotion = 'neutral' | 'happy' | 'sad';

const sentiment = new Sentiment();

export function getEmotionFromText(text: string): Emotion {
  const result = sentiment.analyze(text);
  const score = result.comparative;

  if (score >= 0.5) {
    return 'happy';
  }

  if (score <= -0.5) {
    return 'sad';
  }

  return 'neutral';
}