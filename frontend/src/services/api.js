import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const analyzeImage = async (imageFile, healthProfile = null) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await axios.post(`${API_URL}/analyze-label`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: { health_profile: healthProfile }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to analyze image');
  }
}; 