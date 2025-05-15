import { useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import BASE_URL from '../config';

export default function ApiLatencyScreen() {
  const [results, setResults] = useState([]);
  const [avg, setAvg] = useState(null);
  const [running, setRunning] = useState(false);

  const runTest = async () => {
    setResults([]);
    setAvg(null);
    setRunning(true);

    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJraWtpQHlhaG9vLmNvbSIsImlhdCI6MTc0NzI2NTU4NywiZXhwIjoxNzQ3MzAxNTg3fQ.nAdMaz7YbPHLH4vm-9AZYMCTPi292ZhpvHUa-qk4eYc';
    const email = 'kiki@yahoo.com';

    const latencies = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      try {
        const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          await res.json(); 
        }
      } catch (err) {
        console.log(`Request ${i + 1} failed:`, err);
      }

      const duration = Date.now() - start;
      latencies.push(duration);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    setResults(latencies);
    setAvg(Math.round(avgLatency));
    setRunning(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title={running ? 'Testing...' : 'Run API Latency Test'}
        onPress={runTest}
        disabled={running}
      />

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Latencies:</Text>
      <ScrollView style={{ maxHeight: 200, marginTop: 10 }}>
        {results.map((lat, i) => (
          <Text key={i}>
            Request {i + 1}: {lat} ms
          </Text>
        ))}
      </ScrollView>

      {avg !== null && (
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          ✅ Average API Response Time: {avg} ms
        </Text>
      )}
    </View>
  );
}
