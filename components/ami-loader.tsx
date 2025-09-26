'use client';

import { useEffect } from 'react';

export const AmiLoader = () => {
  useEffect(() => {
    const amiScriptElementId = '__ami__';
    const devPollIntervalMs = 1_000;
    let intervalId: number | undefined;
    const removeExistingAmiScript = () => {
      const existingAmiScript = document.getElementById(amiScriptElementId);
      if (existingAmiScript) {
        existingAmiScript.remove();
      }
    };

    let isCancelled = false;

    const appendAmiScript = async () => {
      try {
        const amiApiResponse = await fetch('/api/ami', {
          cache: 'no-store',
        });
        if (!amiApiResponse.ok) {
          throw new Error(`Failed to load /api/ami: ${amiApiResponse.status}`);
        }

        const amiScriptContent = await amiApiResponse.text();
        const existingAmiScript = document.getElementById(amiScriptElementId) as HTMLScriptElement | null;

        if (existingAmiScript?.textContent === amiScriptContent) {
          return;
        }
        if (isCancelled) {
          return;
        }

        const amiScriptElement = document.createElement('script');
        amiScriptElement.id = amiScriptElementId;
        amiScriptElement.type = 'text/javascript';
        amiScriptElement.textContent = amiScriptContent;

        if (existingAmiScript) {
          existingAmiScript.replaceWith(amiScriptElement);
        } else {
          document.body.appendChild(amiScriptElement);
        }
      } catch (error) {
        console.error(error);
      }
    };

    appendAmiScript();

    if (process.env.NODE_ENV === 'development') {
      intervalId = window.setInterval(() => {
        appendAmiScript();
      }, devPollIntervalMs);
    }

    return () => {
      isCancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      removeExistingAmiScript();
    };
  }, []);

  return null;
};
