import { useEffect, useRef } from "react";
import sceneSource from "../../assets/ai-assistant-source.png";

export default function AiSceneArtwork({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.src = sceneSource;
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;
      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const greenDominance = green - Math.max(red, blue);

        if (greenDominance > 45 && green > 110) {
          pixels[index + 3] = Math.max(
            0,
            255 - Math.min(255, (greenDominance - 45) * 4),
          );
          pixels[index + 1] = Math.min(green, Math.max(red, blue) + 18);
        }
      }
      context.putImageData(frame, 0, 0);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
