import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const INTERNAL_SECRET = process.env.INTERNAL_SHARED_SECRET;

export const proxyToAI = async (path, method, body = {}) => {
  try {
    const config = {
      method,
      url: `${AI_SERVICE_URL}${path}`,
      headers: { 'X-Internal-Secret': INTERNAL_SECRET },
    };

    if (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
      config.data = body;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(`Could not connect to AI service at ${AI_SERVICE_URL}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};
