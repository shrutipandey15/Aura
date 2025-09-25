/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { useLiveApi, UseLiveApiResults } from '../hooks/media/use-live-api';
import { Emotion, getEmotionFromText } from '../lib/sentiment';

/**
 * Define the complete shape of our context, including all the new states
 * that will make the character feel more alive.
 */
export type LiveAPIContextType = UseLiveApiResults & {
  emotion: Emotion; // The AI's current speaking emotion
  setEmotion: (emotion: Emotion) => void;
  userVolume: number; // The user's current microphone volume
  setUserVolume: (volume: number) => void;
  listeningEmotion: Emotion; // The emotion detected from the user's speech
  setListeningEmotion: (emotion: Emotion) => void;
};

const LiveAPIContext = createContext<LiveAPIContextType | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: ReactNode;
  apiKey: string;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  apiKey,
  children,
}) => {
  const liveAPI = useLiveApi({ apiKey });

  // Add all the state we need to track for dynamic expressions
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [userVolume, setUserVolume] = useState(0);
  const [listeningEmotion, setListeningEmotion] = useState<Emotion>('neutral');

  // Add listeners to update the AI's own emotion when it speaks
  liveAPI.client.on('content', (data) => {
    if (data.modelTurn?.parts) {
      const text = data.modelTurn.parts.map(p => p.text).join(' ');
      if (text) {
        setEmotion(getEmotionFromText(text));
      }
    }
  });
  liveAPI.client.on('turncomplete', () => {
    setEmotion('neutral');
  });

  // Combine all state and functions into the value for the provider
  const value = {
    ...liveAPI,
    emotion,
    setEmotion,
    userVolume,
    setUserVolume,
    listeningEmotion,
    setListeningEmotion,
  };

  return (
    <LiveAPIContext.Provider value={value}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error('useLiveAPIContext must be used wihin a LiveAPIProvider');
  }
  return context;
};