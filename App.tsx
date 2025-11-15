import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { VOICES } from './constants';
import { pcmToWav, decodeBase64 } from './utils/audioUtils';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { VoiceSettings } from './components/VoiceSettings';
import { AudioOutput } from './components/AudioOutput';
import { HistoryList } from './components/HistoryList';
import { SpinnerIcon, SparklesIcon } from './components/Icons';
import { type VoiceOption, type HistoryItem } from './types';

const MAX_HISTORY = 5;

export default function App() {
  const [text, setText] = useState<string>('Hello! I am a friendly AI assistant powered by Gemini. You can type any text here to convert it into speech.');
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICES[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const cleanText = (inputText: string): string => {
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const spaceRegex = /\s\s+/g;
    return inputText.replace(emojiRegex, '').replace(spaceRegex, ' ').trim();
  };

  const handleGenerateSpeech = useCallback(async (textToConvert: string) => {
    const cleanedText = cleanText(textToConvert);
    if (!cleanedText) {
      setError('Please enter some text to generate speech.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanedText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error('No audio data received from API.');
      }

      const rawPcmData = decodeBase64(base64Audio);
      const wavBlob = pcmToWav(rawPcmData, { sampleRate: 24000 });
      const audioUrl = URL.createObjectURL(wavBlob);

      const newAudioItem: HistoryItem = {
        id: Date.now().toString(),
        text: cleanedText,
        voice: VOICES.find(v => v.id === selectedVoice)?.name || 'Unknown',
        audioUrl,
        blob: wavBlob,
      };

      setGeneratedAudio(newAudioItem);
      setHistory(prev => [newAudioItem, ...prev.slice(0, MAX_HISTORY - 1)]);

    } catch (e) {
      console.error('API Error:', e);
      setError('Failed to generate speech. Please check your API key and network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [ai, selectedVoice]);

  const handleRegenerate = () => {
    if (generatedAudio) {
      handleGenerateSpeech(generatedAudio.text);
    }
  };

  const handlePlayFromHistory = (item: HistoryItem) => {
    setGeneratedAudio(item);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-base-100 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8 z-10">
        <Header />
        <main className="bg-base-200/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <TextInput text={text} onTextChange={setText} />
              <VoiceSettings
                voices={VOICES}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
              />
            </div>
            <div className="flex flex-col space-y-6">
              <AudioOutput
                generatedAudio={generatedAudio}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
              />
              <HistoryList
                history={history}
                onPlay={handlePlayFromHistory}
                currentAudioId={generatedAudio?.id}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            {error && <p className="text-accent text-center mb-4 animate-fade-in">{error}</p>}
            <button
              onClick={() => handleGenerateSpeech(text)}
              disabled={isLoading || !text}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:from-base-300 disabled:to-base-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center text-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-light/50"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="-ml-1 mr-3 h-6 w-6" />
                  Generate Voice
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}