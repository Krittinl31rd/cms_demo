import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton({ scrollContainerRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const toggleVisibility = () => {
      setVisible(container.scrollTop > 100);
    };

    container.addEventListener("scroll", toggleVisibility);
    toggleVisibility();

    return () => container.removeEventListener("scroll", toggleVisibility);
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    const container = scrollContainerRef?.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-2 z-20 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-700 transition"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
