import * as Device from 'expo-device';

export const getDeviceInfo = () => {
  return {
    model: Device.modelName,
    os: Device.osVersion,
    manufacturer: Device.manufacturer,
  };
};
