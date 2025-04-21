// src/api/sendData.js - with error handling for endpoint connectivity

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/endpoints';

console.log ("Module:SendData");

export const sendDataToServer = async (payload) => {
  try {
    console.log ("Module:SendData Action:sendDataToServer");
    
    console.log (API_URL);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log (`log ${response.status}`);

      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending data to server:', error.message);

    // Save to retry queue
    try {
        console.log ("Module:SendData Action:retryQueue");
      const queue = JSON.parse(await AsyncStorage.getItem('retryQueue') || '[]');
      queue.push(payload);
      await AsyncStorage.setItem('retryQueue', JSON.stringify(queue));
    } catch (storageError) {
      console.error('Failed to save to retry queue:', storageError.message);
    }

    throw error;
  }
};

export const retryFailedRequests = async () => {
    console.log ("Module:SendData Action:retryFailedRequests");

  const rawQueue = await AsyncStorage.getItem('retryQueue');
  if (!rawQueue) return;

  const queue = JSON.parse(rawQueue);
  const remaining = [];

  for (const payload of queue) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Retry failed');
    } catch (error) {
      remaining.push(payload); // still failed, keep it
    }
  }

  await AsyncStorage.setItem('retryQueue', JSON.stringify(remaining));
};
