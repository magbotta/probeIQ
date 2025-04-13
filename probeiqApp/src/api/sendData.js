import { API_URL } from '../config/endpoints';

export const sendDataToServer = async (payload) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to send data:', error);
    throw error;
  }
};
