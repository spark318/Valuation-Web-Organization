import apiClient from './apiClient';

export const fetchPapers = async () => {
  try {
    const response = await apiClient.get('/papers/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch papers');
  }
};

export const fetchPaperById = async (id) => {
  try {
    const response = await apiClient.get(`/papers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch paper details');
  }
};

export const uploadPaper = async (formData) => {
  try {
    const response = await apiClient.post('/papers/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload paper');
  }
};

export const reportPaper = async (paperId) => {
  try {
    const response = await apiClient.post(`/papers/${paperId}/report/`, {});
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to report paper');
  }
}; 