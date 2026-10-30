"use client";

import { useEffect, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type PublicEventName =
  | "courses_updated"
  | "categories_updated"
  | "site_content_updated"
  | "public_settings_updated"
  | "faqs_updated"
  | "testimonials_updated";

/**
 * React hook subscribing to the backend public Server-Sent Events (SSE) stream.
 * Automatically handles connection, graceful reconnects with exponential backoff,
 * event dispatching, and teardown cleanup on component unmount.
 */
export function usePublicRealtime(
  onEvent?: (event: string, data: any) => void,
  eventFilter?: PublicEventName[]
) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;
    let reconnectAttempts = 0;

    const connect = () => {
      if (!isMounted) return;

      try {
        const streamUrl = `${API_BASE}/events/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.onopen = () => {
          reconnectAttempts = 0;
        };

        const eventNames: PublicEventName[] = [
          "courses_updated",
          "categories_updated",
          "site_content_updated",
          "public_settings_updated",
          "faqs_updated",
          "testimonials_updated",
        ];

        eventNames.forEach((name) => {
          if (!eventFilter || eventFilter.includes(name)) {
            eventSource?.addEventListener(name, (e: MessageEvent) => {
              try {
                const parsed = JSON.parse(e.data);
                handlerRef.current?.(name, parsed);
              } catch {
                handlerRef.current?.(name, {});
              }
            });
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            // Reconnection backoff strategy: 1s, 2s, 4s, capped at 10s
            const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
            reconnectAttempts++;
            reconnectTimeout = setTimeout(connect, delay);
          }
        };
      } catch (err) {
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
}

