import * as Network from 'expo-network';

export const getNetworkInfo = async () => {
  const network = await Network.getNetworkStateAsync();
  return {
    type: network.type,
    isConnected: network.isConnected,
  };
};
