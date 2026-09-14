import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-20 right-6 z-30 grid size-11 place-items-center rounded-full bg-[#18122B] text-white shadow-xl shadow-[#18122B]/30 ring-2 ring-white/20 transition-all hover:-translate-y-1 hover:bg-[#393053] focus:outline-none sm:bottom-8 sm:right-8 sm:size-12"
    >
      <ArrowUp size={20} />
    </button>
  );
}
