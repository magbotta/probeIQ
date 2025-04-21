// src/background/taskRegister.js - Updated to use react-native-uuid

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getLocation } from '../services/locationService';
import { getDeviceInfo } from '../services/deviceService';
import { getNetworkInfo } from '../services/networkService';
import { testDownloadSpeed, testUploadSpeed } from '../services/speedTestService';
import { sendDataToServer, retryFailedRequests } from '../api/sendData';
import uuid from 'react-native-uuid';

const TASK_NAME = 'background-network-probe';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log ("Run Task Register");
    
    const uuidValue = uuid.v4();
    const location = await getLocation();
    const device = getDeviceInfo();
    const network = await getNetworkInfo();
    const downloadSpeed = await testDownloadSpeed();
    const uploadSpeed = await testUploadSpeed();

    const payload = {
      uuid: uuidValue,
      timestamp: new Date().toISOString(),
      gps: location,
      device,
      network,
      speedTest: {
        downloadMbps: downloadSpeed,
        uploadMbps: uploadSpeed,
      },
    };

    await sendDataToServer(payload);
    await retryFailedRequests();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  return BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 900, // every 15 mins
    stopOnTerminate: false,
    startOnBoot: true,
  });
};
