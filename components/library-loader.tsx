'use client';

import { useEffect } from 'react';

export const LibraryLoader = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const libraryScriptElementId = '__library__';
    const devPollIntervalMs = 1_000;
    let intervalId: number | undefined;
    const removeExistingLibraryScript = () => {
      const existingLibraryScript = document.getElementById(
        libraryScriptElementId
      );
      if (existingLibraryScript) {
        existingLibraryScript.remove();
      }
    };

    let isCancelled = false;

    const appendLibraryScript = async () => {
      try {
        const libraryApiResponse = await fetch('/api/library', {
          cache: 'no-store',
        });
        if (!libraryApiResponse.ok) {
          throw new Error(
            `Failed to load /api/library: ${libraryApiResponse.status}`
          );
        }

        const libraryScriptContent = await libraryApiResponse.text();
        const existingLibraryScript = document.getElementById(
          libraryScriptElementId
        ) as HTMLScriptElement | null;

        if (existingLibraryScript?.textContent === libraryScriptContent) {
          return;
        }
        if (isCancelled) {
          return;
        }

        const libraryScriptElement = document.createElement('script');
        libraryScriptElement.id = libraryScriptElementId;
        libraryScriptElement.type = 'text/javascript';
        libraryScriptElement.textContent = libraryScriptContent;

        if (existingLibraryScript) {
          existingLibraryScript.replaceWith(libraryScriptElement);
        } else {
          document.body.appendChild(libraryScriptElement);
        }
      } catch (error) {
        console.error(error);
      }
    };

    appendLibraryScript();

    if (process.env.NODE_ENV === 'development') {
      intervalId = window.setInterval(() => {
        appendLibraryScript();
      }, devPollIntervalMs);
    }

    return () => {
      isCancelled = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
      removeExistingLibraryScript();
    };
  }, []);

  return null;
};
