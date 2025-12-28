import { useEffect, useRef, useState } from "react";

const ReviewsSection = () => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded) {
          const script = document.createElement("script");
          script.src = "https://elfsightcdn.com/platform.js";
          script.async = true;
          document.body.appendChild(script);
          setLoaded(true);
        }
      },
      { rootMargin: "200px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div ref={ref} className="mt-12">
      <div
        className="elfsight-app-8a0e5574-cfe8-4377-b5d0-790a27dc73a2"
        data-elfsight-app-lazy
      />
    </div>
  );
};

export default ReviewsSection;