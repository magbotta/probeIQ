import * as Network from 'expo-network';

export const getNetworkInfo = async () => {
    
    console.log ("Module:Network Activity:collect network data");
  const network = await Network.getNetworkStateAsync();
  return {
    type: network.type,
    isConnected: network.isConnected,
  };
};
