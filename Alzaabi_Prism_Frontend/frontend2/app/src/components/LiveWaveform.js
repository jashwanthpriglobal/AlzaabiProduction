import React, { useEffect, useRef } from "react";
 
/**
 * BarWaveform (Scrolling, Slow, ChatGPT-Style)
 * Props:
 * - stream: MediaStream (from getUserMedia)
 * - width, height: Canvas size (default 600x36)
 * - color: bar color (default #000)
 * - barWidth: width of each bar in px (default 2)
 * - gap: gap between bars in px (default 2)
 */
const BarWaveform = ({
  stream,
  width = 600,
  height = 36,
  color = "#000",
  barWidth = 2,
  gap = 2,
  bgColor = "transparent"
}) => {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
 
  // Create a buffer to hold the last N bar heights
  const barsCount = Math.floor(width / (barWidth + gap));
  const barsBuffer = useRef(Array(barsCount).fill(2)); // min 2px for silence
 
  useEffect(() => {
    if (!stream) return;
 
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
 
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Very low FFT for chunky bars
    analyserRef.current = analyser;
 
    const source = audioCtx.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);
 
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
 
    let frameCount = 0;
 
function draw() {
  if (!canvasRef.current) return;
  analyser.getByteTimeDomainData(dataArray);
 
  // Calculate current bar height
  const min = Math.min(...dataArray);
  const max = Math.max(...dataArray);
// Calculate amplitude (scale it up for more movement)
// let amplitude = (max - min) / 128; // Range 0-2 for audio
// amplitude = Math.min(1, amplitude * 1.5); // Boost the scale, cap at 1
// const amp = Math.max(2, amplitude * height); // Height in px, min 2
let amplitude = (max - min) / 128;
amplitude = amplitude * 2.5; // Try 2.5x boost, you can tweak this
const amp = Math.max(2, Math.min(height, amplitude * height));
 




  frameCount++;
  // Only push a new bar every 3 frames (slow down)
  if (frameCount % 3 === 0) {
    barsBuffer.current.push(amp);
    if (barsBuffer.current.length > barsCount)
      barsBuffer.current.shift();
  }
 
  // Draw all bars
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, width, height);
for (let i = 0; i < barsBuffer.current.length; i++) {
  const barHeight = barsBuffer.current[i];
  const x = i * (barWidth + gap);
  const y = (height - barHeight) / 2;
 
  // If the bar represents speaking (above threshold), color white; else, black
  ctx.fillStyle = barHeight > 2 ? "#000" : "#bdbdbd";
  ctx.fillRect(x, y, barWidth, barHeight);
}
 
  animationRef.current = requestAnimationFrame(draw);
}
 
 
    draw();
 
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
      }
      sourceRef.current && sourceRef.current.disconnect();
      analyserRef.current && analyserRef.current.disconnect();
    };
    // Only re-run when stream changes
    // eslint-disable-next-line
  }, [stream, width, height, color, barWidth, gap]);
 
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        background: bgColor,
        borderRadius: 8,
        display: "block",
        width: "100%",
        height: `${height}px`,
      }}
    />
  );
};
 
export default BarWaveform;