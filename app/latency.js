import { Client } from '@stomp/stompjs';
import { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import SockJS from 'sockjs-client';
import BASE_URL from '../config';

export default function LatencyScreen() {
  const [latencies, setLatencies] = useState([]);
  const [avgLatency, setAvgLatency] = useState(null);
  const [client, setClient] = useState(null);
  const [testRunning, setTestRunning] = useState(false);
  const sendTimesRef = useRef([]); // Track send timestamps
  const newLatencies = useRef([]); // Store latencies during test
  const myEmail = 'kiki@yahoo.com'; 

  useEffect(() => {
    const socket = new SockJS(`${BASE_URL}/chat`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      onConnect: () => {
        console.log('✅ WebSocket connected');

        stompClient.subscribe('/topic/messages', (msg) => {
          const body = JSON.parse(msg.body);

          if (body.senderEmail === myEmail && body.content === 'Latency test') {
            const receivedTime = Date.now();
            const sentTime = sendTimesRef.current.shift(); 

            if (sentTime) {
              const latency = receivedTime - sentTime;
              newLatencies.current.push(latency);
              console.log(`📶 Latency ${newLatencies.current.length}: ${latency} ms`);
              setLatencies([...newLatencies.current]);

              if (newLatencies.current.length >= 10) {
                setTestRunning(false);
                const avg = newLatencies.current.reduce((a, b) => a + b, 0) / newLatencies.current.length;
                setAvgLatency(Math.round(avg));
              }
            }
          }
        });
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, []);

  const runLatencyTest = async () => {
    if (!client || !client.connected) {
      alert('WebSocket not connected yet');
      return;
    }

    setLatencies([]);
    setAvgLatency(null);
    setTestRunning(true);
    newLatencies.current = [];
    sendTimesRef.current = [];

    for (let i = 0; i < 10; i++) {
      const sendTime = Date.now();
      sendTimesRef.current.push(sendTime);

      const message = {
        senderEmail: myEmail,
        receiverEmail: myEmail,
        content: 'Latency test',
      };

      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });

      await new Promise((r) => setTimeout(r, 400)); 
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title={testRunning ? 'Running...' : 'Run WebSocket Latency Test'}
        onPress={runLatencyTest}
        disabled={testRunning}
      />
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Latencies:</Text>
      <ScrollView style={{ maxHeight: 200, marginTop: 10 }}>
        {latencies.map((lat, i) => (
          <Text key={i}>Message {i + 1}: {lat} ms</Text>
        ))}
      </ScrollView>
      {avgLatency !== null && (
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          ✅ Average Latency: {avgLatency} ms
        </Text>
      )}
    </View>
  );
}
