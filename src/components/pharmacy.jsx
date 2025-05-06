import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Alert, Input } from "@material-tailwind/react";
import { Activity, CheckCircle, AlertTriangle, XCircle, Box, Thermometer, DollarSign } from 'lucide-react'; // Added relevant icons
import { useNavigate } from 'react-router-dom';
import networks from "../utils/networks";
import { initWeb3 as initializeWeb3 } from '../utils/web3Connection_User';
import { initWeb3 as initializeMedecinWeb3 } from '../utils/web3Connection_medecin';

function Pharmacy() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [userContract, setUserContract] = useState(null);
  const [medecinContract, setMedecinContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [userAccount, setUserAccount] = useState("");
  const [isNetwork, setNetwork] = useState(false);
  const [isInstalled, setInstalled] = useState(false);
  const [error, setError] = useState("");
  const [storageUnitId, setStorageUnitId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [medId, setMedId] = useState('');
  const [txStatus, setTxStatus] = useState({ success: null, message: '' });
  const [saleTxStatus, setSaleTxStatus] = useState({ success: null, message: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  // Network checking functions
  const checkNetwork = async (networkName) => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const targetNetwork = networks[networkName]?.chainId;
        return chainId.toLowerCase() === targetNetwork.toLowerCase();
      } catch (error) {
        console.error("Network check failed:", error);
        return false;
      }
    }
    return false;
  };

  const handleNetworkSwitch = async (networkName) => {
    setError("");
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networks[networkName]]
      });
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  // Web3 Initialization for both contracts
  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        // Initialize user contract
        const userWeb3 = await initializeWeb3();
        setUserContract(userWeb3.contractInstance);

        // Initialize medecin contract
        const medecinWeb3 = await initializeMedecinWeb3();
        setMedecinContract(medecinWeb3.contractInstance);
        setWeb3Instance(medecinWeb3.web3Instance);
        setAccounts(medecinWeb3.accounts);
      } catch (error) {
        setError("Failed to initialize Web3");
      }
    };
    loadWeb3();
  }, []);

  // Account and Network Management
  useEffect(() => {
    const verifyNetwork = async () => {
      const result = await checkNetwork("ganache");
      setNetwork(result);
    };

    const checkAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setUserAccount(accounts[0]);
        } catch (error) {
          console.error("Account check failed:", error);
        }
      }
    };

    const init = async () => {
      setInstalled(!!window.ethereum?.isMetaMask);
      await verifyNetwork();
      checkAccount();
    };

    init();
  }, []);

  // Authorization Check using user contract
  useEffect(() => {
    const checkAuthorization = async () => {
      if (userContract && userAccount) {
        try {
          const isUser = await userContract.methods.getAllUserAddresses().call()
            .then(addresses => addresses.some(addr => addr.toLowerCase() === userAccount.toLowerCase()));

          if (isUser) {
            const userData = await userContract.methods.getUser(userAccount).call();
            setUserRole(userData.role);
            setIsAuthorized(userData.role === "Pharmacy");
          }
        } catch (error) {
          console.error("Authorization check failed:", error);
        }
      }
    };
    checkAuthorization();
  }, [userContract, userAccount]);

  // Storage Assignment Handler
  const handleAssignment = async () => {
    setTxStatus({ success: null, message: '' });
    try {
      await medecinContract.methods.assignBoxToIoT(storageUnitId, batchId)
        .send({ from: userAccount });
      setTxStatus({ success: true, message: 'Storage unit linked successfully!' });
      setStorageUnitId('');
      setBatchId('');
    } catch (error) {
      setTxStatus({ success: false, message: `Error: ${error.message}` });
    }
  };

  // Medication Sale Handler
  const handleMarkAsSold = async () => {
    setSaleTxStatus({ success: null, message: '' });
    try {
      await medecinContract.methods.markMedicamentAsSold(medId)
        .send({ from: userAccount });
      setSaleTxStatus({ success: true, message: 'Medication marked as sold!' });
      setMedId('');
    } catch (error) {
      setSaleTxStatus({ success: false, message: `Error: ${error.message}` });
    }
  };

  // Connection Requirements Check
  if (!isInstalled || !isNetwork || !userAccount || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 p-4"> {/* Enhanced background */}
        <Card className="p-8 rounded-2xl shadow-xl max-w-xl w-full text-center bg-white/90 backdrop-blur-sm"> {/* Softer corners, stronger shadow, slight transparency */}
          <div className="flex flex-col items-center mb-8"> {/* Increased bottom margin */}
            <AlertTriangle className="h-20 w-20 text-orange-600 mb-6 animate-pulse" /> {/* Larger icon, subtle animation */}
            <Typography variant="h3" className="mb-3 font-semibold text-gray-800"> {/* Larger, bolder title */}
              Pharmacy System Requirements
            </Typography>
            <Typography variant="paragraph" className="text-gray-600">
              Please ensure you meet the following requirements to access the pharmacy dashboard.
            </Typography>
          </div>

          <div className="space-y-6 text-left mb-8 border-t border-b border-gray-200 py-6"> {/* Added borders and padding */}
            <div className="flex items-center gap-4">
              {isInstalled ? <CheckCircle className="text-green-600 h-6 w-6" /> : <XCircle className="text-red-600 h-6 w-6" />} {/* Larger icons */}
              <Typography className="text-lg text-gray-700 font-medium">MetaMask Installed</Typography> {/* Larger, slightly bolder text */}
            </div>

            <div className="flex items-center gap-4">
              {isNetwork ? <CheckCircle className="text-green-600 h-6 w-6" /> : <XCircle className="text-red-600 h-6 w-6" />}
              <Typography className="text-lg text-gray-700 font-medium">Connected to Ganache Network</Typography>
              {!isNetwork && isInstalled && (
                <Button size="md" onClick={() => handleNetworkSwitch("ganache")} className="bg-green-600 hover:bg-green-700 transition duration-300 ease-in-out"> {/* More prominent button */}
                  Switch Network
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {userAccount ? <CheckCircle className="text-green-600 h-6 w-6" /> : <XCircle className="text-red-600 h-6 w-6" />}
              <Typography className="text-lg text-gray-700 font-medium">Wallet Connected</Typography>
            </div>

            <div className="flex items-center gap-4">
              {isAuthorized ? <CheckCircle className="text-green-600 h-6 w-6" /> : <XCircle className="text-red-600 h-6 w-6" />}
              <Typography className="text-lg text-gray-700 font-medium">Authorized as {userRole}</Typography>
            </div>
          </div>

          {error && <Alert color="red" className="mt-6 rounded-lg shadow-md">{error}</Alert>} {/* Styled alert */}

          <Button variant="gradient" color="blue-gray" className="mt-8 w-full py-3 text-lg rounded-lg shadow-md" onClick={() => navigate('/')}> {/* Styled button */}
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100 p-8"> {/* Enhanced background and padding */}
      <div className="max-w-5xl mx-auto"> {/* Wider container */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-200"> {/* Separator line */}
          <div className="flex items-center">
            <div className="bg-green-600 text-white p-4 rounded-full mr-5 shadow-lg"> {/* Circular icon container, larger, shadow */}
              <Activity className="h-10 w-10" /> {/* Larger icon */}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800">Pharmacy Management System</h1> {/* Larger, bolder title */}
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm"> {/* Styled account display */}
            <Typography variant="small" className="mr-2 text-gray-700 font-medium">Connected:</Typography>
            <Typography variant="small" className="font-mono text-green-700">{userAccount.slice(0, 6)}...{userAccount.slice(-4)}</Typography>
          </div>
        </div>

        {error && <Alert color="red" className="mb-6 rounded-lg shadow-md">{error}</Alert>} {/* Styled alert */}

        {/* Storage Management Section */}
        <Card className="p-8 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm mb-8"> {/* Styled card */}
          <Typography variant="h4" className="mb-6 font-semibold text-gray-800 border-b pb-4 border-gray-200"> {/* Styled heading */}
            Cold Chain Management
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> {/* Increased gap */}
            <div className="flex items-center gap-3"> {/* Added flex for icon alignment */}
              <Thermometer className="text-blue-500 h-6 w-6" /> {/* Thermometer icon */}
              <Input
                label="Refrigeration Unit ID"
                value={storageUnitId}
                onChange={(e) => setStorageUnitId(e.target.value)}
                size="lg" // Larger input
              />
            </div>
            <div className="flex items-center gap-3"> {/* Added flex for icon alignment */}
              <Box className="text-purple-500 h-6 w-6" /> {/* Box icon */}
              <Input
                label="Vaccine Batch ID"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                size="lg" // Larger input
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleAssignment}
              disabled={!storageUnitId || !batchId}
              className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 transition duration-300 ease-in-out rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed" // Styled button, added disabled styles
            >
              Link Storage Unit
            </Button>
          </div>

          {txStatus.message && (
            <Alert color={txStatus.success ? "green" : "red"} className="mt-6 rounded-lg shadow-md"> {/* Styled alert */}
              {txStatus.message}
            </Alert>
          )}
        </Card>

        {/* Sales Management Section */}
        <Card className="p-8 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm mb-8"> {/* Styled card */}
          <Typography variant="h4" className="mb-6 font-semibold text-gray-800 border-b pb-4 border-gray-200"> {/* Styled heading */}
            Medication Sales
          </Typography>

          <div className="grid grid-cols-1 gap-6 mb-8"> {/* Increased gap */}
            <div className="flex items-center gap-3"> {/* Added flex for icon alignment */}
              <Box className="text-orange-500 h-6 w-6" /> {/* Box icon for med */}
              <Input
                label="Medication ID"
                value={medId}
                onChange={(e) => setMedId(e.target.value)}
                size="lg" // Larger input
              />
            </div>

            <Button
              onClick={handleMarkAsSold}
              disabled={!medId}
              className="w-full py-3 text-lg bg-red-600 hover:bg-red-700 transition duration-300 ease-in-out rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed" // Styled button, added disabled styles
            >
              Mark as Sold
            </Button>
          </div>

          {saleTxStatus.message && (
            <Alert color={saleTxStatus.success ? "green" : "red"} className="mt-6 rounded-lg shadow-md"> {/* Styled alert */}
              {saleTxStatus.message}
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Pharmacy;                                                                                                                                          