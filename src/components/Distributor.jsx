import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Alert, Input, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react"; // Added Dialog components
import { Truck, CheckCircle, AlertTriangle, XCircle, Box, Wifi, QrCode } from 'lucide-react'; // Added Box, Wifi, and QrCode icons
import { useNavigate } from 'react-router-dom';
import networks from "../utils/networks";
import { initWeb3 as initializeWeb3 } from '../utils/web3Connection_User';
import { initWeb3 as initializeMedecinWeb3 } from '../utils/web3Connection_medecin';
import { QrReader } from 'react-qr-reader'; // Import the QR reader component

function Distributor() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [userContract, setUserContract] = useState(null);
  const [medecinContract, setMedecinContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [userAccount, setUserAccount] = useState("");
  const [isNetwork, setNetwork] = useState(false);
  const [isInstalled, setInstalled] = useState(false);
  const [error, setError] = useState("");
  const [iotId, setIotId] = useState('');
  const [boxId, setBoxId] = useState('');
  const [txStatus, setTxStatus] = useState({ success: null, message: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState("");

  // State for QR code scanning
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannedBoxId, setScannedBoxId] = useState('');
  const [scanError, setScanError] = useState('');

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
            setIsAuthorized(userData.role === "Distributor");
          }
        } catch (error) {
          console.error("Authorization check failed:", error);
        }
      }
    };
    checkAuthorization();
  }, [userContract, userAccount]);

  // Effect to update boxId when scannedBoxId changes
  useEffect(() => {
    if (scannedBoxId) {
      setBoxId(scannedBoxId);
      setShowQrScanner(false); // Close scanner after successful scan
    }
  }, [scannedBoxId]);

  // Assignment Handler using medecin contract
  const handleAssignment = async () => {
    setTxStatus({ success: null, message: '' });
    try {
      await medecinContract.methods.assignBoxToIoT(iotId, boxId)
        .send({ from: userAccount });
      setTxStatus({ success: true, message: 'Assignment successful!' });
      setIotId('');
      setBoxId('');
      setScannedBoxId(''); // Clear scanned ID after assignment
    } catch (error) {
      setTxStatus({ success: false, message: `Error: ${error.message}` });
    }
  };

  // QR Code Scan Handlers
  const handleScan = (result, error) => {
    if (result) {
      setScannedBoxId(result?.text);
      setScanError('');
    }
    if (error) {
      // console.error("QR Scan Error:", error); // Optional: log error
      setScanError('Error scanning QR code. Please try again.');
    }
  };

  const handleScanError = (err) => {
    console.error("QR Reader Error:", err);
    setScanError('Failed to initialize camera. Please check permissions.');
    setShowQrScanner(false); // Close scanner on fatal error
  };

  const handleCloseScanner = () => {
    setShowQrScanner(false);
    setScanError(''); // Clear scan error on close
  };


  // Connection Requirements Check
  if (!isInstalled || !isNetwork || !userAccount || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4"> {/* Enhanced background */}
        <Card className="p-8 rounded-2xl shadow-xl max-w-xl w-full text-center bg-white/90 backdrop-blur-sm"> {/* Softer corners, stronger shadow, slight transparency */}
          <div className="flex flex-col items-center mb-8"> {/* Increased bottom margin */}
            <AlertTriangle className="h-20 w-20 text-orange-600 mb-6 animate-pulse" /> {/* Larger icon, subtle animation */}
            <Typography variant="h3" className="mb-3 font-semibold text-gray-800"> {/* Larger, bolder title */}
              Connection Required
            </Typography>
            <Typography variant="paragraph" className="text-gray-600">
              Please ensure you meet the following requirements to access the distributor dashboard.
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
                <Button size="md" onClick={() => handleNetworkSwitch("ganache")} className="bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out"> {/* More prominent button */}
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

  // Main Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8"> {/* Enhanced background and padding */}
      <div className="max-w-5xl mx-auto"> {/* Wider container */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-200"> {/* Separator line */}
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-4 rounded-full mr-5 shadow-lg"> {/* Circular icon container, larger, shadow */}
              <Truck className="h-10 w-10" /> {/* Larger icon */}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800">Device Manager</h1> {/* Larger, bolder title */}
          </div>
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm"> {/* Styled account display */}
            <Typography variant="small" className="mr-2 text-gray-700 font-medium">Connected:</Typography>
            <Typography variant="small" className="font-mono text-blue-700">{userAccount.slice(0, 6)}...{userAccount.slice(-4)}</Typography>
          </div>
        </div>

        {error && <Alert color="red" className="mb-6 rounded-lg shadow-md">{error}</Alert>} {/* Styled alert */}

        <Card className="p-8 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm"> {/* Styled card */}
          <Typography variant="h4" className="mb-6 font-semibold text-gray-800 border-b pb-4 border-gray-200"> {/* Styled heading */}
            Assign Box to IoT Device
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> {/* Increased gap */}
            <div className="flex items-center gap-3"> {/* Added flex for icon alignment */}
              <Wifi className="text-blue-500 h-6 w-6" /> {/* IoT icon */}
              <Input
                label="IoT Device ID"
                value={iotId}
                onChange={(e) => setIotId(e.target.value)}
                size="lg" // Larger input
              />
            </div>
            <div className="flex flex-col gap-3"> {/* Changed to flex-col to stack input and button */}
              <div className="flex items-center gap-3"> {/* Inner flex for icon and input */}
                <Box className="text-purple-500 h-6 w-6" /> {/* Box icon */}
                <Input
                  label="Box ID"
                  value={boxId}
                  onChange={(e) => setBoxId(e.target.value)}
                  size="lg" // Larger input
                  readOnly={scannedBoxId !== ''} // Make read-only if scanned
                />
              </div>
              {scannedBoxId && (
                 <Typography variant="small" className="text-green-700 mt-1 pl-9"> {/* Display scanned ID below input */}
                    Scanned ID: {scannedBoxId}
                 </Typography>
              )}
              <Button
                onClick={() => setShowQrScanner(true)}
                variant="outlined" // Use outlined variant for scan button
                className="flex items-center justify-center gap-2 mt-2" // Styled button
                size="md"
              >
                <QrCode className="h-5 w-5" /> Scan QR Code
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleAssignment}
              disabled={!iotId || !boxId}
              className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed" // Styled button, added disabled styles
            >
              Assign Device
            </Button>
          </div>

          {txStatus.message && (
            <Alert color={txStatus.success ? "green" : "red"} className="mt-6 rounded-lg shadow-md"> {/* Styled alert */}
              {txStatus.message}
            </Alert>
          )}
        </Card>

        {/* QR Scanner Dialog */}
        <Dialog open={showQrScanner} handler={handleCloseScanner} size="sm">
          <DialogHeader>Scan Box QR Code</DialogHeader>
          <DialogBody divider className="flex flex-col items-center">
            {scanError && (
              <Alert color="red" className="mb-4 w-full">{scanError}</Alert>
            )}
            <div className="w-full max-w-xs"> {/* Container for the scanner */}
              <QrReader
                onResult={handleScan}
                onError={handleScanError}
                style={{ width: '100%' }}
                constraints={{ facingMode: 'environment' }} // Prefer rear camera
              />
            </div>
            <Typography variant="small" className="mt-4 text-gray-600">
              Point your camera at the box's QR code.
            </Typography>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseScanner}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
          </DialogFooter>
        </Dialog>

      </div>
    </div>
  );
}

export default Distributor;