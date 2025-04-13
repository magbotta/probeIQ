// App.js - Final version with dashboard, upload/download speed, offline retry, and background task

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { getLocation } from './src/services/locationService';
import { getDeviceInfo } from './src/services/deviceService';
import { getNetworkInfo } from './src/services/networkService';
import { testDownloadSpeed, testUploadSpeed } from './src/services/speedTestService';
import { sendDataToServer, retryFailedRequests } from './src/api/sendData';
import { registerBackgroundTask } from './src/background/taskRegister';

const NetworkProbeApp = () => {
  const [uuid] = useState(uuidv4());
  const [status, setStatus] = useState('Initializing...');
  const [data, setData] = useState(null);

  const collectAndSendData = async () => {
    try {
      setStatus('Collecting data...');

      const location = await getLocation();
      const device = getDeviceInfo();
      const network = await getNetworkInfo();
      const downloadSpeed = await testDownloadSpeed();
      const uploadSpeed = await testUploadSpeed();

      const payload = {
        uuid,
        timestamp: new Date().toISOString(),
        gps: location,
        device,
        network,
        speedTest: {
          downloadMbps: downloadSpeed,
          uploadMbps: uploadSpeed,
        },
      };

      setData(payload);
      await sendDataToServer(payload);
      setStatus('Data sent successfully!');
    } catch (error) {
      console.error('Error collecting or sending data:', error);
      setStatus('Error sending data');
    }

    await retryFailedRequests();
  };

  useEffect(() => {
    collectAndSendData();
    registerBackgroundTask();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>📡 Network Probe Status</Text>
      <Text style={{ marginBottom: 10 }}>{status}</Text>

      {data && (
        <View style={{ marginTop: 10 }}>
          <Text>🕒 Timestamp: {data.timestamp}</Text>
          <Text>📍 Latitude: {data.gps?.lat}</Text>
          <Text>📍 Longitude: {data.gps?.lon}</Text>
          <Text>📶 Network Type: {data.network?.type}</Text>
          <Text>✅ Connected: {data.network?.isConnected ? 'Yes' : 'No'}</Text>
          <Text>⬇️ Download Speed: {data.speedTest?.downloadMbps} Mbps</Text>
          <Text>⬆️ Upload Speed: {data.speedTest?.uploadMbps} Mbps</Text>
          <Text>📱 Device Model: {data.device?.model}</Text>
          <Text>⚙️ OS Version: {data.device?.os}</Text>
          <Text>🏭 Manufacturer: {data.device?.manufacturer}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default NetworkProbeApp;
