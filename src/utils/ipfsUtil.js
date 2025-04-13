import axios from 'axios';

const IPFS_API_URL = 'http://localhost:5001/api';
const IPFS_GATEWAY = 'http://localhost:8080/ipfs';

const ipfsUtil = {
  uploadToIPFS: async (data) => {
    try {
      const jsonData = JSON.stringify(data);
      const formData = new FormData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      formData.append('file', blob);

      const response = await axios.post(`${IPFS_API_URL}/v0/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data.Hash; // IPFS hash (CID)
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  },

  getFromIPFS: async (hash) => {
    try {
      const response = await axios.get(`${IPFS_GATEWAY}/${hash}`);
      return response.data;
    } catch (error) {
      console.error("Error getting data from IPFS:", error);
      throw error;
    }
  },

  getIPFSUrl: (hash) => {
    return `${IPFS_GATEWAY}/${hash}`;
  },
};

export default ipfsUtil;