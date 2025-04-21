import * as Location from 'expo-location';

export const getLocation = async () => {
  console.log ("Get Location");
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    lat: location.coords.latitude,
    lon: location.coords.longitude,
  };
};
