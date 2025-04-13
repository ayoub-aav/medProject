// src/utils/web3Connection.js
import { ethers } from 'ethers';
import Medecin from '../build/Medecin.json'; // Adjust path as required

const getEthereumContract = async () => {
    // Request account access
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed contract address
        const contract = new ethers.Contract(contractAddress, Medecin.abi, signer);
        return contract;
    } else {
        console.error("Ethereum object doesn't exist!");
        throw new Error("Ethereum object doesn't exist!");
    }
};

export default getEthereumContract;