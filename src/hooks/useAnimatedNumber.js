import { useEffect, useState } from "react";

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

export function useAnimatedNumber(target, duration = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target) || 0;
    if (end === 0) {
      setValue(0);
      return undefined;
    }

    let startTime = null;
    let frameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return value;
}
