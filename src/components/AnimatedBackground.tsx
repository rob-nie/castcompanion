
import { useEffect, useState } from "react";

export const AnimatedBackground = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initiale Prüfung
    checkDarkMode();

    // Beobachter für Änderungen am class-Attribut
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className={`w-full h-full ${isDarkMode ? 'bg-cast-dark-bg' : 'bg-cast-light-bg'}`}>
        {!isDarkMode && (
          <div 
            className="gradient absolute"
            style={{
              width: 'var(--size, 750px)',
              height: 'var(--size, 750px)',
              filter: 'blur(calc(var(--size, 750px) / 5))',
              backgroundImage: 'linear-gradient(#14A090, #7A9992)',
              animation: 'rotate var(--speed, 50s) var(--easing, cubic-bezier(0.8, 0.2, 0.2, 0.8)) alternate infinite',
              borderRadius: '30% 70% 70% 30%/30% 30% 70% 70%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
    </div>
  );
};
