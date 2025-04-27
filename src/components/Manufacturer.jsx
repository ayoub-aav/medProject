import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Upload } from 'lucide-react';
import { initWeb3 } from '../utils/web3Connection_medecin';
import { processMedicamentCSVFile } from '../utils/processMedicamentCSV';
import { uploadPDFToIPFS } from '../utils/PDF-IPFS';

export default function Manufacturer() {
  const [web3Instance, setWeb3Instance] = useState();
  const [contractInstance, setContractInstance] = useState();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRawMaterials, setShowRawMaterials] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLotId, setCurrentLotId] = useState(null);
  const [ipfsUploadStatus, setIpfsUploadStatus] = useState({});
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
        temperature: BigInt(parseInt(boxConditions.temperature)),
        humidite: BigInt(parseInt(boxConditions.humidite)),
        positionX: boxConditions.positionX.toString(),
        positionY: boxConditions.positionY.toString(),
        timestamp: BigInt(Math.floor(Date.now() / 1000))
      };
  
      // Define batch size
      const batchSize = 20;
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
  
        // Add a 20% buffer to the gas estimate
        const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.2);
  
        // Execute transaction for the batch
        await contractInstance.methods
          .createAndAssignMedicaments(batchBoxes, BigInt(currentLotId), conditionsData)
          .send({
            from: accounts[0],
            gas: gasWithBuffer
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
  <label className="block text-gray-700 text-xs font-medium mb-1">Analysis Cert.</label>
  <div className="relative flex items-center">
    <input
      type="file"
      accept=".pdf"
      id={`certificatAnalyse-${index}`}
      name="certificatAnalyse"
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          const cid = await uploadPDFToIPFS(file);
          console.log(cid);
          handleRawMaterialChange(index, {
            target: {
              name: 'certificatAnalyse',
              value: cid
            }
          });
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }}
      className="block w-full text-xs text-gray-700 px-2 py-1 border border-gray-300 rounded-md
      file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs
      file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
    />
    {/* Always show the X button when a file is selected */}
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
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
}



























// import React, { useState, useEffect } from 'react';
// import { initWeb3 } from '../utils/web3Connection_medecin';
// import {getPDFFromIPFS} from '../utils/PDF-IPFS'

// function Manufacturer() {
//   const [web3Instance, setWeb3Instance] = useState(null);
//   const [contractInstance, setContractInstance] = useState(null);
//   const [accounts, setAccounts] = useState([]);
//   const [medicamentId, setMedicamentId] = useState('');
//   const [boxId, setBoxId] = useState('');
//   const [medicamentDetails, setMedicamentDetails] = useState(null);
//   const [boxMedicaments, setBoxMedicaments] = useState([]);
//   const [rawMaterialsHash, setRawMaterialsHash] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         const { web3Instance, contractInstance, accounts } = await initWeb3();
//         setWeb3Instance(web3Instance);
//         setContractInstance(contractInstance);
//         setAccounts(accounts);
//         console.log("Connected to contract at:", contractInstance._address);
//       } catch (error) {
//         console.error('Failed to connect:', error);
//         setError('Failed to connect to blockchain');
//       }
//     };
//     initialize();
//   }, []);

//   const safeToString = (value) => {
//     try {
//       return value !== undefined && value !== null ? String(value) : '';
//     } catch (err) {
//       console.error("Error converting value to string:", value, err);
//       return '';
//     }
//   };

//   const getRawMaterialsHash = async (lotId) => {
//     if (!lotId || !contractInstance) return '';
    
//     try {
//       const rawMaterials = await contractInstance.methods
//         .getMatieresPremieresForLot(lotId)
//         .call({ from: accounts[0] });
  
//       console.log("Retrieved raw materials:", rawMaterials);
      
//       // If it's an object with certificatAnalyse property, return that
//       if (rawMaterials && typeof rawMaterials === 'object' && rawMaterials.certificatAnalyse) {
//         return rawMaterials.certificatAnalyse;
//       }
      
//       return '';
//     } catch (error) {
//       console.error("Error retrieving hash:", error);
//       return '';
//     }
//   };
  
//   const fetchMedicamentData = async () => {
//     if (!medicamentId || !contractInstance) return;

//     setLoading(true);
//     setError(null);
//     setMedicamentDetails(null);
//     setRawMaterialsHash(""); // Reset this value

//     try {
//       const unit = await contractInstance.methods
//         .getMedicamentDetails(medicamentId)
//         .call({ from: accounts[0] });

//       if (!unit || unit.medicamentId === "") {
//         throw new Error('Medicament not found');
//       }

//       const lot = await contractInstance.methods
//         .lots(unit.lotId)
//         .call({ from: accounts[0] });

//       const rawMaterials = await contractInstance.methods
//         .getMatieresPremieresForLot(unit.lotId)
//         .call({ from: accounts[0] });

//       // Update raw materials hash - look for certificatAnalyse in the raw materials
//       if (rawMaterials && typeof rawMaterials === 'object') {
//         if (rawMaterials.certificatAnalyse) {
//           setRawMaterialsHash(rawMaterials.certificatAnalyse);
//         } else {
//           console.log("Raw materials object doesn't contain certificatAnalyse", rawMaterials);
//           setRawMaterialsHash(lot.certificatAnalyse || "Not available");
//         }
//       } else {
//         // Fallback to the lot's certificate
//         setRawMaterialsHash(lot.certificatAnalyse || "Not available");
//       }

//       setMedicamentDetails({
//         unit: {
//           medicamentId: unit.medicamentId,
//           lotId: safeToString(unit.lotId),
//           conditionsActuelles: {
//             temperature: safeToString(unit.conditionsActuelles.temperature),
//             humidite: safeToString(unit.conditionsActuelles.humidite),
//             positionX: unit.conditionsActuelles.positionX,
//             positionY: unit.conditionsActuelles.positionY,
//             timestamp: new Date(Number(unit.conditionsActuelles.timestamp) * 1000).toLocaleString()
//           },
//           timestampCreation: new Date(Number(unit.timestampCreation) * 1000).toLocaleString()
//         },
//         lot: {
//           nomMedicament: lot.nomMedicament,
//           substanceActive: lot.substanceActive,
//           forme: lot.forme,
//           dateFabrication: lot.dateFabrication,
//           datePeremption: lot.datePeremption,
//           nomFabricant: lot.nomFabricant,
//           paysOrigine: lot.paysOrigine,
//           amm: lot.amm,
//           conditionsConservation: {
//             temperatureMax: safeToString(lot.conditionsConservation.temperatureMax),
//             temperatureMin: safeToString(lot.conditionsConservation.temperatureMin),
//             humiditeMax: safeToString(lot.conditionsConservation.humiditeMax),
//             humiditeMin: safeToString(lot.conditionsConservation.humiditeMin)
//           },
//           matieresPremieresLot: Array.isArray(rawMaterials) ? rawMaterials : [],
//           certificatAnalyse: lot.certificatAnalyse // Match contract's field name
//         }
//       });
//       console.log(medicamentDetails);

//     } catch (err) {
//       console.error('Error fetching medicament details:', err);
//       setError(`Medicament not found or error fetching details: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBoxMedicaments = async () => {
//     if (!boxId || !contractInstance) return;

//     setLoading(true);
//     setError(null);
//     setBoxMedicaments([]);

//     try {
//       const medicamentIds = await contractInstance.methods
//         .getMedicamentsInBox(boxId)
//         .call({ from: accounts[0] });

//       setBoxMedicaments(medicamentIds || []);

//       if (!medicamentIds || medicamentIds.length === 0) {
//         setError(`No medicaments found in box ${boxId}`);
//       }
//     } catch (err) {
//       console.error('Error fetching box medicaments:', err);
//       setError(`Failed to fetch box medicaments: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to safely render objects
//   const renderObject = (obj) => {
//     if (!obj) return null;
    
//     if (typeof obj === 'object' && obj !== null) {
//       // Convert object to string representation
//       return JSON.stringify(obj);
//     }
    
//     return String(obj);
//   };

//   const handleDownloadPDF = async (cid) => {
//     try {
//       setLoading(true);
      
//       const response = await getPDFFromIPFS(cid);
      
//       // Check if data exists and has minimum PDF size (typically >100 bytes)
//       if (!response?.data || response.data.byteLength < 100) {
//         throw new Error('Downloaded file is too small or empty');
//       }
      
      
      
//       // Proceed with download
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `certificate-${cid}.pdf`; // Use full CID for uniqueness
//       document.body.appendChild(a);
//       a.click();
      
//       // Cleanup
//       setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//       }, 100);
      
//     } catch (error) {
//       console.error('PDF download error:', error);
//       setError(`Failed to download PDF: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Extract certificate hash directly from raw materials if possible
//   const extractCertificateAnalyse = () => {
//     if (!medicamentDetails) return "No data";
    
//     // Try to find it in the raw materials list
//     if (medicamentDetails.lot.matieresPremieresLot) {
//       if (typeof medicamentDetails.lot.matieresPremieresLot === 'object' && 
//           medicamentDetails.lot.matieresPremieresLot.certificatAnalyse) {
//         return medicamentDetails.lot.matieresPremieresLot.certificatAnalyse;
//       }
      
//       // If it's an array, try to find the first entry with certificatAnalyse
//       if (Array.isArray(medicamentDetails.lot.matieresPremieresLot)) {
//         for (const material of medicamentDetails.lot.matieresPremieresLot) {
//           if (material && typeof material === 'object' && material.certificatAnalyse) {
//             return material.certificatAnalyse;
//           }
//         }
//       }
//     }
    
//     // Fallback to rawMaterialsHash state
//     return rawMaterialsHash || medicamentDetails.lot.certificatAnalyse || "Not available";
//   };

//   const certificateHash = medicamentDetails ? extractCertificateAnalyse() : "Not available";
//   console.log('Certificate Hash (CID):', certificateHash);

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6 text-center">Medicament Lookup</h1>

//       {!accounts.length ? (
//         <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
//           No Ethereum accounts connected. Please connect your wallet.
//         </div>
//       ) : (
//         <div className="p-4 bg-green-100 text-green-700 rounded-md mb-6">
//           Connected account: {accounts[0]}
//         </div>
//       )}

//       {error && (
//         <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         <div className="bg-gray-50 p-4 rounded-md">
//           <h2 className="text-xl font-semibold mb-4">Lookup Medicament by ID</h2>
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={medicamentId}
//               onChange={(e) => setMedicamentId(e.target.value)}
//               placeholder="Enter medicament ID"
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             />
//             <button
//               onClick={fetchMedicamentData}
//               disabled={loading || !medicamentId}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//             >
//               {loading ? 'Loading...' : 'Lookup'}
//             </button>
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 rounded-md">
//           <h2 className="text-xl font-semibold mb-4">Lookup Medicaments in Box</h2>
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={boxId}
//               onChange={(e) => setBoxId(e.target.value.trim())}
//               placeholder="Enter box ID"
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
//             />
//             <button
//               onClick={fetchBoxMedicaments}
//               disabled={loading || !boxId}
//               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
//             >
//               {loading ? 'Loading...' : 'Lookup'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {medicamentDetails && (
//         <div className="bg-gray-50 p-4 rounded-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">Medicament Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <h3 className="font-medium mb-2">Lot Information</h3>
//               <div className="space-y-2">
//                 <p><span className="font-semibold">Name:</span> {medicamentDetails.lot.nomMedicament}</p>
//                 <p><span className="font-semibold">Active Substance:</span> {medicamentDetails.lot.substanceActive}</p>
//                 <p>
//                   <span className="font-semibold">Certificate Hash:</span>{" "}
//                   {certificateHash}
//                   {certificateHash && certificateHash !== "Not available" && (
//                     <button
//                       onClick={() => handleDownloadPDF(certificateHash)}
//                       className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                       disabled={!certificateHash || certificateHash === "Not available"}
//                     >
//                       Download PDF
//                     </button>
//                   )}
//                 </p>
                
//                 {/* Add more detailed information */}
//                 <p><span className="font-semibold">Forme:</span> {medicamentDetails.lot.forme}</p>
//                 <p><span className="font-semibold">Date Fabrication:</span> {medicamentDetails.lot.dateFabrication}</p>
//                 <p><span className="font-semibold">Date Péremption:</span> {medicamentDetails.lot.datePeremption}</p>
//                 <p><span className="font-semibold">Fabricant:</span> {medicamentDetails.lot.nomFabricant}</p>
//                 <p><span className="font-semibold">Pays d'origine:</span> {medicamentDetails.lot.paysOrigine}</p>
//                 <p><span className="font-semibold">AMM:</span> {medicamentDetails.lot.amm}</p>
//               </div>
//             </div>
            
//             <div>
//               <h3 className="font-medium mb-2">Conditions Actuelles</h3>
//               <div className="space-y-2">
//                 <p><span className="font-semibold">Température:</span> {medicamentDetails.unit.conditionsActuelles.temperature}°C</p>
//                 <p><span className="font-semibold">Humidité:</span> {medicamentDetails.unit.conditionsActuelles.humidite}%</p>
//                 <p><span className="font-semibold">Position:</span> X: {medicamentDetails.unit.conditionsActuelles.positionX}, Y: {medicamentDetails.unit.conditionsActuelles.positionY}</p>
//                 <p><span className="font-semibold">Timestamp:</span> {medicamentDetails.unit.conditionsActuelles.timestamp}</p>
//               </div>
              
//               <h3 className="font-medium mt-4 mb-2">Conditions de Conservation</h3>
//               <div className="space-y-2">
//                 <p><span className="font-semibold">Température:</span> {medicamentDetails.lot.conditionsConservation.temperatureMin}°C - {medicamentDetails.lot.conditionsConservation.temperatureMax}°C</p>
//                 <p><span className="font-semibold">Humidité:</span> {medicamentDetails.lot.conditionsConservation.humiditeMin}% - {medicamentDetails.lot.conditionsConservation.humiditeMax}%</p>
//               </div>
//             </div>
//           </div>
          
//           {medicamentDetails.lot.matieresPremieresLot && (
//             <div className="mt-4">
//               <h3 className="font-medium mb-2">Matières Premières</h3>
//               {typeof medicamentDetails.lot.matieresPremieresLot === 'string' ? (
//                 <p>{medicamentDetails.lot.matieresPremieresLot}</p>
//               ) : Array.isArray(medicamentDetails.lot.matieresPremieresLot) ? (
//                 medicamentDetails.lot.matieresPremieresLot.length > 0 ? (
//                   <ul className="list-disc pl-5">
//                     {medicamentDetails.lot.matieresPremieresLot.map((material, index) => (
//                       <li key={index}>
//                         {typeof material === 'object' ? 
//                           Object.entries(material)
//                             .filter(([key]) => isNaN(parseInt(key))) // Filter out numeric keys
//                             .map(([key, value]) => (
//                               <span key={key}>
//                                 <strong>{key}: </strong>{renderObject(value)}{", "}
//                               </span>
//                             ))
//                           : String(material)}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>No raw materials information available</p>
//                 )
//               ) : (
//                 <div>
//                   {Object.entries(medicamentDetails.lot.matieresPremieresLot)
//                     .filter(([key]) => isNaN(parseInt(key))) // Filter out numeric keys
//                     .map(([key, value], index) => (
//                       <p key={index}><strong>{key}:</strong> {renderObject(value)}</p>
//                     ))
//                   }
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {boxMedicaments.length > 0 && (
//         <div className="bg-gray-50 p-4 rounded-md">
//           <h2 className="text-xl font-semibold mb-4">Medicaments in Box {boxId}</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
//             {boxMedicaments
//               .filter(medId => medId && medId.trim() !== "")
//               .map((medId, index) => (
//                 <div key={index} className="p-3 bg-white rounded border border-gray-200">
//                   <p className="font-medium">{medId}</p>
//                   <button
//                     onClick={() => {
//                       setMedicamentId(medId.trim());
//                       setTimeout(() => fetchMedicamentData(), 100);
//                     }}
//                     className="mt-2 text-sm text-blue-600 hover:text-blue-800"
//                   >
//                     View Details
//                   </button>
//                 </div>
//               ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Manufacturer;