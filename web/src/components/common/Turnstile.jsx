import React, { useEffect, useRef, useState } from 'react';

const Turnstile = ({ sitekey, onVerify, onExpire, onError, theme = 'auto', size = 'normal', ...props }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  
  // Use refs to keep callbacks fresh without triggering effect re-runs
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

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
        const id = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: (token) => {
            if (onVerifyRef.current) onVerifyRef.current(token);
          },
          'expired-callback': () => {
            if (onExpireRef.current) onExpireRef.current();
          },
          'error-callback': (error) => {
            if (onErrorRef.current) onErrorRef.current(error);
          },
          theme,
          size,
          ...props,
        });
        widgetId.current = id;
      } catch (error) {
        console.error('Turnstile render error:', error);
      }
    }

    return () => {
      // Only remove if sitekey/theme/size changes, not on every render
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (error) {
          console.warn('Turnstile remove error:', error);
        }
        widgetId.current = null;
      }
    };
    // Exclude props, onVerify, onExpire, onError from dependency array to prevent re-rendering loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnstileLoaded, sitekey, theme, size]);

  return <div ref={containerRef} style={{ minHeight: '65px', minWidth: '300px' }} />;
};

export default Turnstile;
