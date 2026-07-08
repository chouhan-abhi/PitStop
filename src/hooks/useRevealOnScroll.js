import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll(options = {}) {
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px" } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible, className: isVisible ? "md3-reveal is-visible" : "md3-reveal" };
}
