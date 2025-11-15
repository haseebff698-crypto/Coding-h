
import { something } from "./constants.ts";

export const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Kore', gender: 'Female', accent: 'English (US), Multilingual' },
  { id: 'Puck', name: 'Puck', gender: 'Male', accent: 'English (US), Multilingual' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', accent: 'English (US), Multilingual' },
  { id: 'Charon', name: 'Charon', gender: 'Female', accent: 'English (US), Multilingual' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', accent: 'English (US), Multilingual' },
];

// Note: The Gemini TTS voices are multilingual and can handle languages like
// Urdu, Hindi, and Arabic even though their names are from mythology.
// The user should input text in their desired language.
