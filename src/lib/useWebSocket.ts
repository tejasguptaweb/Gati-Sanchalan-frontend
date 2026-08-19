import { useState, useEffect } from 'react';

export function useWebSocket(url: string = 'ws://127.0.0.1:8000/ws/telemetry') {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (err) {
            console.error('Failed to parse WS telemetry frame:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnect in 3s
          timer = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.warn('WebSocket connection error, retrying...');
          ws?.close();
        };
      } catch (err) {
        console.error('WebSocket connection setup error:', err);
        timer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (timer) clearTimeout(timer);
      if (ws) ws.close();
    };
  }, [url]);

  return { data, isConnected };
}
