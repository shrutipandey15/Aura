/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RefObject, useEffect, useState, useRef } from 'react';

import { renderBasicFace } from './basic-face-render';

import useFace from '../../../hooks/demo/use-face';
import useHover from '../../../hooks/demo/use-hover';
import useTilt from '../../../hooks/demo/use-tilt';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { Emotion } from '@/lib/sentiment'; // Import the Emotion type

// Minimum volume level that indicates audio output is occurring
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;

// Amount of delay between end of audio output and setting talking state to false
const TALKING_STATE_COOLDOWN_MS = 2000;

// Add emotion to the component's props
type BasicFaceProps = {
  /** The canvas element on which to render the face. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** The radius of the face. */
  radius?: number;
  /** The color of the face. */
  color?: string;
  emotion?: Emotion; // This prop is now passed from KeynoteCompanion
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
}: BasicFaceProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get all the new reactive states from our context
  const { volume, userVolume, emotion, listeningEmotion } = useLiveAPIContext();

  // State for when the AI is talking
  const [isTalking, setIsTalking] = useState(false);
  // State for when the user is talking (listening)
  const [isListening, setIsListening] = useState(false);

  const [scale, setScale] = useState(0.1);

  // Face state from custom hooks
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();

  // The tilt animation is now active if the agent is talking OR listening
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking || isListening,
  });

  // Decide which emotion to show: prioritize the agent's own emotion while it's talking.
  const displayEmotion = isTalking ? emotion : listeningEmotion;

  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Detect whether the agent is talking based on its output volume
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => setIsTalking(false),
        TALKING_STATE_COOLDOWN_MS
      );
    }
  }, [volume]);

  // Detect whether the user is talking based on their microphone volume
  useEffect(() => {
    const USER_AUDIO_THRESHOLD = 0.01; // A small threshold to ignore background noise
    if (userVolume > USER_AUDIO_THRESHOLD) {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  }, [userVolume]);

  // Render the face on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    // Pass the final displayEmotion to the render function
    renderBasicFace({ ctx, mouthScale, eyeScale, color, emotion: displayEmotion });
  }, [canvasRef, eyeScale, mouthScale, color, scale, displayEmotion]);

  return (
    <canvas
      className="basic-face"
      ref={canvasRef}
      width={radius * 2 * scale}
      height={radius * 2 * scale}
      style={{
        display: 'block',
        borderRadius: '50%',
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
    />
  );
}