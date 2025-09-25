/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Emotion } from "@/lib/sentiment";

type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  emotion?: Emotion;
};

/**
 * Renders a simple, solid-color character face.
 */
export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color = '#FFFFFF',
    emotion = 'neutral',
  } = props;
  const { width, height } = ctx.canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;

  // Clear the canvas for a fresh draw
  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // Draw the main face circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw features
  ctx.translate(centerX, centerY);
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';

  const eyeOffsetY = radius * -0.15;
  const mouthOffsetY = radius * 0.45;
  const eyeRadiusX = radius * 0.15;
  const eyeRadiusY = radius * 0.2;
  const eyeOffsetX = radius * 0.4;

  // Eyes
  ctx.beginPath();
  ctx.ellipse(
    -eyeOffsetX,
    eyeOffsetY,
    eyeRadiusX,
    eyeRadiusY * Math.max(0.1, eyesOpenness),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    eyeOffsetX,
    eyeOffsetY,
    eyeRadiusX,
    eyeRadiusY * Math.max(0.1, eyesOpenness),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Mouth
 const mouthWidth = radius * 0.5;
  const mouthHeight = radius * 0.08 + radius * 0.3 * mouthOpenness;
  ctx.beginPath();

  // Change mouth shape based on emotion
  if (emotion === 'happy') {
    // Draw an upward arc for a smile
    ctx.arc(0, mouthOffsetY - mouthHeight, mouthWidth / 2.5, 0, Math.PI, false);
    ctx.lineWidth = mouthHeight * 0.5;
    ctx.stroke();
  } else if (emotion === 'sad') {
    // Draw a downward arc for a frown
    ctx.arc(0, mouthOffsetY + mouthHeight, mouthWidth / 2.5, Math.PI, Math.PI * 2, false);
    ctx.lineWidth = mouthHeight * 0.5;
    ctx.stroke();
  } else {
    // Default neutral mouth
    ctx.ellipse(
      0,
      mouthOffsetY,
      mouthWidth / 2,
      mouthHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}
