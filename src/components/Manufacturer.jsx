import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Plus, Minus, Upload } from 'lucide-react';
import { initWeb3 } from '../utils/web3Connection_medecin';
import { processMedicamentCSVFile } from '../utils/processMedicamentCSV';
import { uploadPDFToIPFS } from '../utils/PDF-IPFS';
import { checkAMMValidity } from '../utils/checkAMMValidity';
import { initWeb3 as userlogin} from '../utils/web3Connection_User';


export default function Manufacturer() {
  const [web3Instance, setWeb3Instance] = useState();
  const [contractInstance, setContractInstance] = useState();
  const [accounts, setAccounts] = useState([]);
  const [web3Instancee, setWeb3Instancee] = useState();
  const [contractInstancee, setContractInstancee] = useState();
  const [accountse, setAccountse] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showRawMaterials, setShowRawMaterials] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLotId, setCurrentLotId] = useState(null);
  const [ipfsUploadStatus, setIpfsUploadStatus] = useState({});
  const [certErrors, setCertErrors] = useState({}); // { [index]: 'Error message' }
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [boxConditions, setBoxConditions] = useState({
    temperature: "",
    humidite: "",
    positionX: "",
    positionY: ""
  });
  
  // Main lot details constant
  const [lotDetails, setLotDetails] = useState({
    nomMedicament: '',
    substanceActive: '',
    forme: '',
    dateFabrication: '',
    datePeremption: '',
    nomFabricant: '',
    paysOrigine: '',
    amm: ''
  });

  // Conservation conditions
  const [conservation, setConservation] = useState({
    temperatureMax: "",
    temperatureMin: "",
    humiditeMax: "",
    humiditeMin: ""
  });

  // Raw materials list
  const [rawMaterials, setRawMaterials] = useState([{
    nom: '',
    origine: '',
    fournisseur: '',
    degrePurete: '',
    quantiteParUnite: '',
    certificatAnalyse: '',
    dateReception: '',
    transport: ''
  }]);

  

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        const { web3Instance, contractInstance, accounts } = await initWeb3();
        setWeb3Instance(web3Instance);
        setContractInstance(contractInstance);
        setAccounts(accounts);
      } catch (error) {
        // Keep error handling but remove console.error
      } finally {
        setIsLoading(false);
      }
    };

    loadWeb3();
  }, []);


  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        const { web3Instance, contractInstance, accounts } = await userlogin();
        setWeb3Instancee(web3Instance);
        setContractInstancee(contractInstance);
        setAccountse(accounts);
      } catch (error) {
        // Keep error handling but remove console.error
      } finally {
        setIsLoading(false);
      }
    };

    loadWeb3();
  }, []);

  const handleLotDetailsChange = (e) => {
    const { name, value } = e.target;
    setLotDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleConservationChange = (e) => {
    const { name, value } = e.target;
    setConservation(prev => ({ ...prev, [name]: value }));
  };

  const handleBoxConditionsChange = (e) => {
    const { name, value } = e.target;
    setBoxConditions(prev => ({ ...prev, [name]: value }));
  };

  const handleRawMaterialChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMaterials = [...rawMaterials];
    updatedMaterials[index] = { ...updatedMaterials[index], [name]: value };
    setRawMaterials(updatedMaterials);
  };

  const addRawMaterial = () => {
    setRawMaterials([...rawMaterials, {
      nom: '',
      origine: '',
      fournisseur: '',
      degrePurete: '',
      quantiteParUnite: '',
      certificatAnalyse: '',
      dateReception: '',
      transport: ''
    }]);
  };

  const removeRawMaterial = (index) => {
    if (rawMaterials.length > 1) {
      const updatedMaterials = rawMaterials.filter((_, i) => i !== index);
      setRawMaterials(updatedMaterials);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };



  const verifyManufacturer = async (contract, address) => {
    try {
      const exists = await contract.methods.doesUserExist(address).call();
      if (!exists) {
        setIsAuthorized(false);
        return;
      }
      
      const userData = await contract.methods.getUser(address).call();
      setIsAuthorized(userData.role.toLowerCase() === "manufacturer");
    } catch (err) {
      console.error("Manufacturer verification failed:", err);
      setIsAuthorized(false);
    }
  };
  
  // Modify the loadWeb3 useEffect to include verification
  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        const { web3Instance, contractInstance, accounts } = await initWeb3();
        setWeb3Instance(web3Instance);
        setContractInstance(contractInstance);
        setAccounts(accounts);
        verifyManufacturer(contractInstance, accounts[0]);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadWeb3();
  }, []);
  
  // Add account change listener
  useEffect(() => {
    if (contractInstancee) {
      if (accounts.length > 0) {
        verifyManufacturer(contractInstancee, accounts[0]);
      } else {
        setIsAuthorized(false); // No accounts connected
      }
    }
  }, [contractInstancee, accounts]);

  useEffect(() => {
    if (!window.ethereum) return;
  
    const handleAccountsChanged = (accs) => {
      setAccounts(accs);
    };
  
    window.ethereum.on('accountsChanged', handleAccountsChanged);
  
    // Cleanup listener on unmount
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const creerLotMedicament = async () => {
    if (!contractInstance || !accounts.length) {
      setTransactionStatus('error: No contract instance or accounts available');
      return;
    }

    try {
      setTransactionStatus('pending');
      
      // Prepare conservation data
      const conservationData = {
        temperatureMax: parseInt(conservation.temperatureMax),
        temperatureMin: parseInt(conservation.temperatureMin),
        humiditeMax: parseInt(conservation.humiditeMax),
        humiditeMin: parseInt(conservation.humiditeMin)
      };

      // Prepare raw materials data
      const matieresPremieres = rawMaterials.map(material => ({
        nom: material.nom,
        origine: material.origine,
        fournisseur: material.fournisseur,
        degrePurete: material.degrePurete,
        quantiteParUnite: material.quantiteParUnite,
        certificatAnalyse: material.certificatAnalyse,
        dateReception: material.dateReception,
        transport: material.transport
      }));

      // Call the smart contract function
      const tx = await contractInstance.methods.creerLotMedicament(
        lotDetails,
        conservationData,
        matieresPremieres
      ).send({ from: accounts[0] });

      const lotId = tx.events.LotCree.returnValues.lotId;
      setCurrentLotId(lotId);
      
      setTransactionStatus('success');
    } catch (error) {
      setTransactionStatus('error: ' + error.message);
    }
  };

  const handleAssign = async () => {
    if (!selectedFile || !contractInstance || accounts.length === 0 || !currentLotId) {
      setTransactionStatus('error: Missing required data');
      return;
    }
  
    try {
      setTransactionStatus('pending-assign');
  
      // Process CSV file
      const boxes = await processMedicamentCSVFile(selectedFile);
  
      // Validate boxes data
      if (!boxes || !Array.isArray(boxes) || boxes.length === 0) {
        throw new Error('Invalid boxes data from CSV');
      }
  
      // Prepare conditions data with proper BigInt conversion
      const conditionsData = {
        tempMax: 0,
        tempMin: 0,
        tempAvg: parseInt(boxConditions.temperature) || 0, // Handle empty values
        humidMax: 0,
        humidMin: 0,
        humidAvg: parseInt(boxConditions.humidite) || 0, // Handle empty values
        x: boxConditions.positionX.toString(),
        y: boxConditions.positionY.toString(),
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      };
  
      // Define batch size
      const batchSize = 10;
      const totalBatches = Math.ceil(boxes.length / batchSize);
  
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, boxes.length);
        const batchBoxes = boxes.slice(start, end);
  
        // Estimate gas for the batch
        let gasEstimate;
        try {
          gasEstimate = await contractInstance.methods
            .createAndAssignMedicaments(batchBoxes, BigInt(currentLotId), conditionsData)
            .estimateGas({ from: accounts[0] });
        } catch (estimateError) {
          throw new Error(`Gas estimate failed for batch: ${estimateError.message}`);
        }

        // Add 50% buffer and enforce network gas limit
        const GAS_LIMIT = 150000000; // Confirm this value matches your network's block gas limit
        const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.5);
        const safeGas = Math.min(gasWithBuffer, GAS_LIMIT);

        console.log('Gas estimate:', gasEstimate);
        console.log('Gas with buffer:', gasWithBuffer);
        console.log('Safe gas limit:', safeGas);

        // Execute transaction with safe gas limit
        await contractInstance.methods
          .createAndAssignMedicaments(batchBoxes, BigInt(currentLotId), conditionsData)
          .send({
            from: accounts[0],
            gas: safeGas  // Use the capped gas value
          });
        console.log(gasEstimate);
        console.log(gasWithBuffer);

      }
  
      setTransactionStatus('success-assign');
      resetForm();
  
    } catch (error) {
      let errorMessage = 'Transaction failed';
      if (error.receipt && error.receipt.gasUsed) {
        errorMessage += ` (Gas used: ${error.receipt.gasUsed})`;
      }
      if (error.message) {
        errorMessage += `: ${error.message.split('\n')[0]}`;
      }
  
      setTransactionStatus(`error-assign: ${errorMessage}`);
    }
  };
  
  // Helper function for resetting form
  const resetForm = () => {
    setSelectedFile(null);
    setCurrentLotId(null);
    setLotDetails({
      nomMedicament: '',
      substanceActive: '',
      forme: '',
      dateFabrication: '',
      datePeremption: '',
      nomFabricant: '',
      paysOrigine: '',
      amm: ''
    });
    setConservation({
      temperatureMax: "",
      temperatureMin: "",
      humiditeMax: "",
      humiditeMin: ""
    });
    setRawMaterials([{
      nom: '',
      origine: '',
      fournisseur: '',
      degrePurete: '',
      quantiteParUnite: '',
      certificatAnalyse: '',
      dateReception: '',
      transport: ''
    }]);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Web3...</div>;
  }
  
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Manufacturer Access Required
          </p>
          <p className="text-gray-600">
            Connect MetaMask with a manufacturer account to use this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 h-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-indigo-600">Manufacturer Interface</h1>
        
        {transactionStatus && (
          <div className={`p-2 rounded-md mb-2 text-sm ${
            transactionStatus.includes('pending') ? 'bg-yellow-100 text-yellow-700' :
            transactionStatus.startsWith('error') ? 'bg-red-100 text-red-700' :
            'bg-green-100 text-green-700'
          }`}>
            {transactionStatus === 'pending' && 'Lot creation in progress...'}
            {transactionStatus === 'success' && 'Lot created successfully! You can now assign medicaments.'}
            {transactionStatus === 'pending-assign' && 'Assigning medicaments to boxes...'}
            {transactionStatus === 'success-assign' && 'Medicaments assigned to boxes successfully!'}
            {transactionStatus.startsWith('error') && transactionStatus}
          </div>
        )}
        
        {!currentLotId ? (
          <div className="flex h-5/6">
            {/* Left Side - Lot Details & Conservation */}
            <div className="w-1/2 pr-3">
              <div className="space-y-3">
                {/* Lot Details Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Lot Details</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Medicine Name</label>
                      <input
                        type="text"
                        name="nomMedicament"
                        value={lotDetails.nomMedicament}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Active Substance</label>
                      <input
                        type="text"
                        name="substanceActive"
                        value={lotDetails.substanceActive}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Form</label>
                      <input
                        type="text"
                        name="forme"
                        value={lotDetails.forme}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Manuf. Date</label>
                        <input
                          type="date"
                          name="dateFabrication"
                          value={lotDetails.dateFabrication}
                          onChange={handleLotDetailsChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Exp. Date</label>
                        <input
                          type="date"
                          name="datePeremption"
                          value={lotDetails.datePeremption}
                          onChange={handleLotDetailsChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Manufacturer</label>
                      <input
                        type="text"
                        name="nomFabricant"
                        value={lotDetails.nomFabricant}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Country</label>
                      <input
                        type="text"
                        name="paysOrigine"
                        value={lotDetails.paysOrigine}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">AMM Number</label>
                      <input
                        type="text"
                        name="amm"
                        value={lotDetails.amm}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Conservation Conditions Section */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Conservation Conditions</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Max Temp (°C)</label>
                        <input
                          type="number"
                          name="temperatureMax"
                          value={conservation.temperatureMax}
                          onChange={handleConservationChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Min Temp (°C)</label>
                        <input
                          type="number"
                          name="temperatureMin"
                          value={conservation.temperatureMin}
                          onChange={handleConservationChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Max Humidity</label>
                        <input
                          type="number"
                          name="humiditeMax"
                          value={conservation.humiditeMax}
                          onChange={handleConservationChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-medium mb-1">Min Humidity</label>
                        <input
                          type="number"
                          name="humiditeMin"
                          value={conservation.humiditeMin}
                          onChange={handleConservationChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={creerLotMedicament}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={!accounts.length || transactionStatus === 'pending'}
                  >
                    {transactionStatus === 'pending' ? 'Processing...' : 'Create Lot'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Side - Raw Materials */}
            <div className="w-1/2 pl-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">Raw Materials</h2>
                  <button
                    type="button"
                    onClick={() => setShowRawMaterials(!showRawMaterials)}
                    className="flex items-center text-indigo-600 text-sm font-medium"
                  >
                    {showRawMaterials ? (
                      <>Hide <ChevronUp size={16} className="ml-1" /></>
                    ) : (
                      <>Show <ChevronDown size={16} className="ml-1" /></>
                    )}
                  </button>
                </div>
                
                {showRawMaterials && (
                  <>
                    <div className="flex-grow overflow-y-auto mb-2 pr-1" style={{ maxHeight: 'calc(100% - 70px)' }}>
                      {rawMaterials.length > 0 ? (
                        rawMaterials.map((material, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-md shadow-sm mb-2">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-gray-800">Raw Material #{index + 1}</h3>
                              <button
                                type="button"
                                onClick={() => removeRawMaterial(index)}
                                className="text-red-500 hover:text-red-700"
                                disabled={rawMaterials.length === 1}
                              >
                                <Minus size={16} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Name</label>
                                <input
                                  type="text"
                                  name="nom"
                                  value={material.nom}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Origin</label>
                                <input
                                  type="text"
                                  name="origine"
                                  value={material.origine}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Supplier</label>
                                <input
                                  type="text"
                                  name="fournisseur"
                                  value={material.fournisseur}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Purity</label>
                                <input
                                  type="text"
                                  name="degrePurete"
                                  value={material.degrePurete}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Quantity/Unit</label>
                                <input
                                  type="text"
                                  name="quantiteParUnite"
                                  value={material.quantiteParUnite}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">
                                  Analysis Cert.
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    id={`certificatAnalyse-${index}`}
                                    name="certificatAnalyse"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      // clear old error
                                      setCertErrors(prev => ({ ...prev, [index]: '' }));
                                      if (!file) return;

                                      // 1️⃣ validate
                                      const valid = await checkAMMValidity(file);
                                      if (!valid) {
                                        setCertErrors(prev => ({
                                          ...prev,
                                          [index]: 'Invalid document. Please select a valid PDF.'
                                        }));
                                        e.target.value = '';
                                        handleRawMaterialChange(index, {
                                          target: { name: 'certificatAnalyse', value: '' }
                                        });
                                        return;
                                      }

                                      // 2️⃣ upload
                                      try {
                                        const cid = await uploadPDFToIPFS(file);
                                        console.log(cid);
                                        handleRawMaterialChange(index, {
                                          target: { name: 'certificatAnalyse', value: cid }
                                        });
                                      } catch (error) {
                                        console.error('Upload failed:', error);
                                        // you can set another error here if you want
                                      }
                                    }}
                                    className="block w-full text-xs text-gray-700 px-2 py-1 border border-gray-300 rounded-md
                                              file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs
                                              file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                  />

                                  {/* X button always visible when a file is selected */}
                                  {document.getElementById(`certificatAnalyse-${index}`)?.files?.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        document.getElementById(`certificatAnalyse-${index}`).value = '';
                                        handleRawMaterialChange(index, {
                                          target: { name: 'certificatAnalyse', value: '' }
                                        });
                                      }}
                                      className="absolute right-2 text-gray-500 hover:text-red-500"
                                      aria-label="Remove file"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </div>

                                {/* validation error */}
                                {certErrors[index] && (
                                  <p className="mt-1 text-red-500 text-xs">{certErrors[index]}</p>
                                )}
                              </div>

                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Reception Date</label>
                                <input
                                  type="date"
                                  name="dateReception"
                                  value={material.dateReception}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs font-medium mb-1">Transport</label>
                                <input
                                  type="text"
                                  name="transport"
                                  value={material.transport}
                                  onChange={(e) => handleRawMaterialChange(index, e)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <p className="text-gray-700 font-medium mb-1">No raw materials found</p>
                          <p className="text-gray-500 text-sm">Add raw materials to get started</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-center mt-auto">
                      <button
                        type="button"
                        onClick={addRawMaterial}
                        className="flex items-center px-4 py-2 bg-gray-100 text-indigo-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Plus size={16} className="mr-2" /> Add Raw Material
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center h-5/6">
            <div className="w-3/4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Assign Medicaments to Boxes</h2>
                <p className="mb-2 text-sm text-gray-600">Current Lot ID: <span className="font-medium">{currentLotId}</span></p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Conditions</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-gray-700 text-xs font-medium mb-1">Temperature</label>
                      <input
                        type="number"
                        name="temperature"
                        value={boxConditions.temperature}
                        onChange={handleBoxConditionsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-xs font-medium mb-1">Humidity</label>
                      <input
                        type="number"
                        name="humidite"
                        value={boxConditions.humidite}
                        onChange={handleBoxConditionsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-xs font-medium mb-1">Position X</label>
                      <input
                        type="text"
                        name="positionX"
                        value={boxConditions.positionX}
                        onChange={handleBoxConditionsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-xs font-medium mb-1">Position Y</label>
                      <input
                        type="text"
                        name="positionY"
                        value={boxConditions.positionY}
                        onChange={handleBoxConditionsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CSV File with Medicament IDs</label>
                  <div className="flex items-center border-2 border-dashed border-gray-300 rounded-md p-3 bg-gray-50">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-3 file:py-1 file:px-3
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-indigo-50 file:text-indigo-600
                        hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-600">Selected file: {selectedFile.name}</p>
                  )}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={handleAssign}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={!selectedFile || transactionStatus === 'pending-assign'}
                  >
                    <Upload size={14} className="mr-1" />
                    {transactionStatus === 'pending-assign' ? 'Assigning...' : 'Assign Medicaments'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCurrentLotId(null)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Back to Lot Creation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-gray-500 text-xs mt-1">
        <p>Activate Windows</p>
        <p>Go to Settings to activate Windows.</p>
      </div>
    </div>
  );
};