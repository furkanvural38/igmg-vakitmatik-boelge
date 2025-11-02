// src/hooks/useVerticalScroll.ts
import { type RefObject, useEffect } from "react";

export const useVerticalScroll = (
    scrollContainerRef: RefObject<HTMLDivElement | null>,
    contentRef: RefObject<HTMLDivElement | null>
) => {
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        const content = contentRef.current;
        if (!scrollContainer || !content) return;

        let scrollAmount = 0;
        let scrollInterval: number | null = null;
        let pauseTimeout: number | null = null;

        const clearTimers = () => {
            if (scrollInterval !== null) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
            if (pauseTimeout !== null) {
                clearTimeout(pauseTimeout);
                pauseTimeout = null;
            }
        };

        const shouldScroll = () => {
            return content.scrollHeight > scrollContainer.clientHeight * 1.1;
        };

        const startCycle = () => {
            clearTimers();

            // Reset ganz nach oben
            scrollAmount = 0;
            scrollContainer.scrollTop = 0;

            // 2s oben zeigen
            pauseTimeout = window.setTimeout(() => {
                const maxScroll =
                    content.scrollHeight - scrollContainer.clientHeight;

                scrollInterval = window.setInterval(() => {
                    // erst setzen
                    scrollContainer.scrollTop = scrollAmount;
                    // dann erhöhen
                    scrollAmount += 1;

                    // unten angekommen?
                    if (scrollAmount >= maxScroll) {
                        clearTimers();

                        // 1s unten stehen bleiben, dann Loop neu
                        pauseTimeout = window.setTimeout(() => {
                            startCycle();
                        }, 1000);
                    }
                }, 30);
            }, 1000);
        };

        if (shouldScroll()) {
            startCycle();
        }

        const resizeObserver = new ResizeObserver(() => {
            clearTimers();
            scrollAmount = 0;
            scrollContainer.scrollTop = 0;
            if (shouldScroll()) {
                startCycle();
            }
        });

        resizeObserver.observe(content);

        return () => {
            clearTimers();
            resizeObserver.disconnect();
        };
    }, [scrollContainerRef, contentRef]);
};
