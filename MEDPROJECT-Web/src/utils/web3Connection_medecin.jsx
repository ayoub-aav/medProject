import Web3 from "web3";
import MedecinContract from '../build/Medecin.json';

export const initWeb3 = async () => {
  if (window.ethereum) {
    const web3Instance = new Web3(window.ethereum);
    const accounts = await web3Instance.eth.getAccounts();
    const networkId = await web3Instance.eth.net.getId();
    const deployedNetwork = MedecinContract.networks[networkId];

    const contractInstance = new web3Instance.eth.Contract(
      MedecinContract.abi,
      deployedNetwork && deployedNetwork.address
    );

    return { web3Instance, contractInstance, accounts };
  } else {
    throw new Error("Ethereum provider not found");
  }
};

// Export as default as well for flexibility
export default { initWeb3 };