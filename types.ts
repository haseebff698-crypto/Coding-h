
export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  accent: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  voice: string;
  audioUrl: string;
  blob: Blob;
}
