import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Alert, Input } from "@material-tailwind/react";
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 rounded-xl shadow-lg max-w-xl w-full text-center">
          <div className="flex flex-col items-center mb-6">
            <AlertTriangle className="h-16 w-16 text-orange-500 mb-4" />
            <Typography variant="h4" className="mb-2">
              Pharmacy System Requirements
            </Typography>
          </div>

          <div className="space-y-6 text-left mb-6">
            <div className="flex items-center gap-4">
              {isInstalled ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              <Typography>MetaMask Installed</Typography>
            </div>

            <div className="flex items-center gap-4">
              {isNetwork ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              <Typography>Connected to Pharmaceutical Network</Typography>
              {!isNetwork && isInstalled && (
                <Button size="sm" onClick={() => handleNetworkSwitch("ganache")}>
                  Switch Network
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {userAccount ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              <Typography>Wallet Connected</Typography>
            </div>

            <div className="flex items-center gap-4">
              {isAuthorized ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
              <Typography>Licensed Pharmacist</Typography>
            </div>
          </div>

          {error && <Alert color="red" className="mt-4">{error}</Alert>}

          <Button variant="text" color="blue-gray" className="mt-6" onClick={() => navigate('/')}>
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-green-600 text-white p-3 rounded-lg mr-4">
              <Activity className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Pharmacy Management System</h1>
          </div>
          <Typography variant="small">{userAccount.slice(0, 6)}...{userAccount.slice(-4)}</Typography>
        </div>

        {error && <Alert color="red" className="mb-4">{error}</Alert>}

        {/* Storage Management Section */}
        <Card className="p-6 rounded-xl shadow-sm mb-8">
          <Typography variant="h5" className="mb-4">
            Cold Chain Management
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Refrigeration Unit ID"
              value={storageUnitId}
              onChange={(e) => setStorageUnitId(e.target.value)}
            />
            <Input
              label="Vaccine Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleAssignment}
              disabled={!storageUnitId || !batchId}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Link Storage Unit
            </Button>
          </div>

          {txStatus.message && (
            <Alert color={txStatus.success ? "green" : "red"} className="mt-4">
              {txStatus.message}
            </Alert>
          )}
        </Card>

        {/* Sales Management Section */}
        <Card className="p-6 rounded-xl shadow-sm mb-8">
          <Typography variant="h5" className="mb-4">
            Medication Sales
          </Typography>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Input
              label="Medication ID"
              value={medId}
              onChange={(e) => setMedId(e.target.value)}
            />
            
            <Button 
              onClick={handleMarkAsSold}
              disabled={!medId}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Mark as Sold
            </Button>
          </div>

          {saleTxStatus.message && (
            <Alert color={saleTxStatus.success ? "green" : "red"} className="mt-4">
              {saleTxStatus.message}
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Pharmacy;