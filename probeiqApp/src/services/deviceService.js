import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system';

export const getDeviceInfo = async () => {
  const storageInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
  const memoryInfo = Device.totalMemory || null; // in bytes, if available

  return {
    model: Device.modelName,
    os: Device.osVersion,
    manufacturer: Device.manufacturer,
    memoryBytes: memoryInfo,
    freeDiskBytes: storageInfo?.freeDiskStorage ?? null,
    totalDiskBytes: storageInfo?.totalDiskStorage ?? null,
  };
};
