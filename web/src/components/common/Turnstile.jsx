import React, { useEffect, useRef, useState } from 'react';

const Turnstile = ({ sitekey, onVerify, onExpire, onError, theme = 'auto', size = 'normal', ...props }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  useEffect(() => {
    // Check if window.turnstile is available
    if (window.turnstile) {
      setTurnstileLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          setTurnstileLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (turnstileLoaded && containerRef.current && !widgetId.current) {
      try {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
          },
          'error-callback': (error) => {
            if (onError) onError(error);
          },
          theme,
          size,
          ...props,
        });
      } catch (error) {
        console.error('Turnstile render error:', error);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (error) {
          console.warn('Turnstile remove error:', error);
        }
        widgetId.current = null;
      }
    };
  }, [turnstileLoaded, sitekey, onVerify, theme, size, props]);

  return <div ref={containerRef} style={{ minHeight: '65px', minWidth: '300px' }} />;
};

export default Turnstile;
