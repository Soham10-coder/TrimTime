import AsyncStorage from '@react-native-async-storage/async-storage';

// Live AWS Production Server API URL (synced with MongoDB Atlas findmysalon & AWS S3 trimtimebucket)
export const API_BASE_URL = 'https://13-235-37-85.nip.io/api';

export const apiCall = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const headers = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { ok: false, error: error.message };
  }
};
