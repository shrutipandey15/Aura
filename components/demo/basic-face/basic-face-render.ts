/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
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

  ctx.restore();
}
