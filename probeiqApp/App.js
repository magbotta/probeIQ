// App.js - Text wrapping fix, export, filters, storage & memory support

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Share, TextInput } from 'react-native';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLocation } from './src/services/locationService';
import { getDeviceInfo } from './src/services/deviceService';
import { getNetworkInfo } from './src/services/networkService';
import { testDownloadSpeed, testUploadSpeed } from './src/services/speedTestService';
import { sendDataToServer, retryFailedRequests } from './src/api/sendData';

const STORAGE_KEY = 'networkProbeHistory';

const NetworkProbeApp = () => {
  const [uuidValue] = useState(uuid.v4());
  const [status, setStatus] = useState('Idle');
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  };

  const saveHistory = async (newHistory) => {
    setHistory(newHistory);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const exportHistory = async () => {
    try {
      const csvRows = [
        'UUID,Timestamp,Latitude,Longitude,DownloadMbps,UploadMbps,NetworkType,Connected,DeviceModel,DeviceOS,Manufacturer,Memory,FreeDisk,TotalDisk',
        ...history.map(h => (
          `${h.uuid},${h.timestamp},${h.gps.lat},${h.gps.lon},${h.speedTest.downloadMbps},${h.speedTest.uploadMbps},${h.network.type},${h.network.isConnected},${h.device.model},${h.device.os},${h.device.manufacturer},${h.device.memoryBytes},${h.device.freeDiskBytes},${h.device.totalDiskBytes}`
        ))
      ];
      const csvContent = csvRows.join('\n');
      await Share.share({ title: 'Export Probe History', message: csvContent });
    } catch (error) {
      Alert.alert('Error', 'Unable to export history');
    }
  };

  const collectAndSendData = async () => {
    try {
      setLoading(true);
      setStatus('Collecting data...');

      const location = await getLocation();
      const device = await getDeviceInfo();
      const network = await getNetworkInfo();
      const downloadSpeed = await testDownloadSpeed();
      const uploadSpeed = await testUploadSpeed();

      const payload = {
        uuid: uuid.v4(),
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
      const updatedHistory = [payload, ...history];
      await saveHistory(updatedHistory);

      setStatus('Sending data...');
      await sendDataToServer(payload);
      setStatus('Data sent successfully!');
    } catch (error) {
      console.error('Error collecting or sending data:', error);
      setStatus('Error sending data');
    } finally {
      setLoading(false);
      await retryFailedRequests();
    }
  };

  const filteredHistory = history.filter(h =>
    h.timestamp.toLowerCase().includes(search.toLowerCase()) ||
    h.uuid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📡 Network Probe</Text>

      <TouchableOpacity style={styles.button} onPress={collectAndSendData} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Collecting...' : 'Run Probe'}</Text>
      </TouchableOpacity>

      <Text style={styles.status}>Status: {status}</Text>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 10 }} />}

      {data && (
        <View style={styles.card}>
          <Text style={styles.header}>📊 Captured Data</Text>
          <Text><Text style={styles.label}>UUID:</Text> {data.uuid}</Text>
          <Text><Text style={styles.label}>Timestamp:</Text> {data.timestamp}</Text>

          <Text style={styles.section}>📍 Location</Text>
          <Text><Text style={styles.label}>Latitude:</Text> {data.gps?.lat}</Text>
          <Text><Text style={styles.label}>Longitude:</Text> {data.gps?.lon}</Text>

          <Text style={styles.section}>📶 Network</Text>
          <Text><Text style={styles.label}>Type:</Text> {data.network?.type}</Text>
          <Text><Text style={styles.label}>Connected:</Text> {data.network?.isConnected ? 'Yes' : 'No'}</Text>

          <Text style={styles.section}>⚡ Speed Test</Text>
          <Text><Text style={styles.label}>Download:</Text> {data.speedTest?.downloadMbps} Mbps</Text>
          <Text><Text style={styles.label}>Upload:</Text> {data.speedTest?.uploadMbps} Mbps</Text>

          <Text style={styles.section}>📱 Device Info</Text>
          <Text><Text style={styles.label}>Model:</Text> {data.device?.model}</Text>
          <Text><Text style={styles.label}>OS:</Text> {data.device?.os}</Text>
          <Text><Text style={styles.label}>Manufacturer:</Text> {data.device?.manufacturer}</Text>
          <Text><Text style={styles.label}>Memory:</Text> {data.device?.memoryBytes}</Text>
          <Text><Text style={styles.label}>Free Disk:</Text> {data.device?.freeDiskBytes}</Text>
          <Text><Text style={styles.label}>Total Disk:</Text> {data.device?.totalDiskBytes}</Text>
        </View>
      )}

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.header}>🕘 History</Text>

          <TextInput
            style={styles.input}
            placeholder="Search by timestamp or UUID..."
            value={search}
            onChangeText={setSearch}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Text style={styles.clearButtonText}>🗑️ Clear History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={exportHistory}>
              <Text style={styles.clearButtonText}>📤 Export CSV</Text>
            </TouchableOpacity>
          </View>

          {filteredHistory.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.label}>UUID: <Text>{item.uuid}</Text></Text>
              <Text style={styles.label}>Time: <Text>{item.timestamp}</Text></Text>
              <Text style={styles.label}>Download: <Text>{item.speedTest.downloadMbps} Mbps</Text></Text>
              <Text style={styles.label}>Upload: <Text>{item.speedTest.uploadMbps} Mbps</Text></Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  status: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  card: {
    marginTop: 25,
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  section: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  label: {
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: 30,
    width: '100%',
  },
  historyCard: {
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
});

export default NetworkProbeApp;