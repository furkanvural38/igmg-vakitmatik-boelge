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

        const canScroll = () => {
            // weniger streng: schon scrollen wenn content einfach größer ist als viewport
            return content.scrollHeight > scrollContainer.clientHeight;
        };

        const startCycle = () => {
            clearTimers();

            // Reset nach oben
            scrollAmount = 0;
            scrollContainer.scrollTop = 0;

            // kurze Pause oben (1s statt 2s)
            pauseTimeout = window.setTimeout(() => {
                const maxScroll =
                    content.scrollHeight - scrollContainer.clientHeight;

                scrollInterval = window.setInterval(() => {
                    scrollContainer.scrollTop = scrollAmount;
                    scrollAmount += 1;

                    // unten angekommen?
                    if (scrollAmount >= maxScroll) {
                        clearTimers();

                        // kurze Pause unten (1s), dann Loop
                        pauseTimeout = window.setTimeout(() => {
                            startCycle();
                        }, 1000);
                    }
                }, 30);
            }, 1000);
        };

        if (canScroll()) {
            startCycle();
        }

        const resizeObserver = new ResizeObserver(() => {
            clearTimers();
            scrollAmount = 0;
            scrollContainer.scrollTop = 0;
            if (canScroll()) {
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
