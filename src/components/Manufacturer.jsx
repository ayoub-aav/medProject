import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Upload } from 'lucide-react';
import { initWeb3 } from '../utils/web3Connection_medecin';
import { processMedicamentCSVFile } from '../utils/processMedicamentCSV';

export default function Manufacturer() {
  const [web3Instance, setWeb3Instance] = useState();
  const [contractInstance, setContractInstance] = useState();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRawMaterials, setShowRawMaterials] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLotId, setCurrentLotId] = useState(null);
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
        console.error("Failed to load web3:", error);
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
      console.log('Transaction successful:', tx);

    } catch (error) {
      console.error('Error creating lot:', error);
      setTransactionStatus('error: ' + error.message);
    }
  };

  const handleAssign = async () => {
    if (!selectedFile || !contractInstance || accounts.length === 0 || !currentLotId) {
      setTransactionStatus('error: Missing required data for assignment');
      return;
    }

    try {
      setTransactionStatus('pending-assign');
      
      const boxMappings = await processMedicamentCSVFile(selectedFile);
      
      // Prepare conditions data
      const conditionsData = {
        temperature: parseInt(boxConditions.temperature),
        humidite: parseInt(boxConditions.humidite),
        positionX: boxConditions.positionX,
        positionY: boxConditions.positionY,
        timestamp: Math.floor(Date.now() / 1000)
      };

      // Convert boxMappings to an array of Box objects
      const boxes = Object.keys(boxMappings).map(boxId => ({
        boxId: boxId,
        medicamentIds: boxMappings[boxId]
      }));

      // Call the contract function with the array of boxes
      await contractInstance.methods
        .createAndAssignMedicaments(
          boxes,
          currentLotId,
          conditionsData
        )
        .send({ from: accounts[0] });
      
      setTransactionStatus('success-assign');
      
      // Reset after successful assignment
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

    } catch (error) {
      console.error('Error during assignment:', error);
      setTransactionStatus('error-assign: ' + error.message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Web3...</div>;
  }

  return (
    <div className="w-full h-screen bg-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Manufacturer Interface</h1>
      
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
          <div className="w-1/2 pr-2 overflow-y-auto">
            <div className="space-y-3">
              {/* Lot Details Section */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Lot Details</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="block text-gray-700">Medicine Name</label>
                    <input
                      type="text"
                      name="nomMedicament"
                      value={lotDetails.nomMedicament}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700">Active Substance</label>
                    <input
                      type="text"
                      name="substanceActive"
                      value={lotDetails.substanceActive}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700">Form</label>
                    <input
                      type="text"
                      name="forme"
                      value={lotDetails.forme}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-1">
                    <div className="w-1/2">
                      <label className="block text-gray-700">Manuf. Date</label>
                      <input
                        type="date"
                        name="dateFabrication"
                        value={lotDetails.dateFabrication}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700">Exp. Date</label>
                      <input
                        type="date"
                        name="datePeremption"
                        value={lotDetails.datePeremption}
                        onChange={handleLotDetailsChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700">Manufacturer</label>
                    <input
                      type="text"
                      name="nomFabricant"
                      value={lotDetails.nomFabricant}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700">Country</label>
                    <input
                      type="text"
                      name="paysOrigine"
                      value={lotDetails.paysOrigine}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700">AMM Number</label>
                    <input
                      type="text"
                      name="amm"
                      value={lotDetails.amm}
                      onChange={handleLotDetailsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Conservation Conditions Section */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conservation Conditions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-1/2">
                      <label className="block text-gray-700">Max Temp (°C)</label>
                      <input
                        type="number"
                        name="temperatureMax"
                        value={conservation.temperatureMax}
                        onChange={handleConservationChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700">Min Temp (°C)</label>
                      <input
                        type="number"
                        name="temperatureMin"
                        value={conservation.temperatureMin}
                        onChange={handleConservationChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <div className="w-1/2">
                      <label className="block text-gray-700">Max Humidity</label>
                      <input
                        type="number"
                        name="humiditeMax"
                        value={conservation.humiditeMax}
                        onChange={handleConservationChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700">Min Humidity</label>
                      <input
                        type="number"
                        name="humiditeMin"
                        value={conservation.humiditeMin}
                        onChange={handleConservationChange}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={creerLotMedicament}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!accounts.length || transactionStatus === 'pending'}
                >
                  {transactionStatus === 'pending' ? 'Processing...' : 'Create Lot'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Raw Materials */}
          <div className="w-1/2 pl-2 overflow-y-auto">
            <div className="bg-gray-50 p-3 rounded-md h-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Raw Materials</h2>
                <button
                  type="button"
                  onClick={() => setShowRawMaterials(!showRawMaterials)}
                  className="flex items-center text-blue-600 text-sm"
                >
                  {showRawMaterials ? (
                    <>Hide <ChevronUp size={14} /></>
                  ) : (
                    <>Show <ChevronDown size={14} /></>
                  )}
                </button>
              </div>
              
              {showRawMaterials && (
                <div className="space-y-3">
                  {rawMaterials.map((material, index) => (
                    <div key={index} className="p-2 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium">Raw Material #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeRawMaterial(index)}
                          className="text-red-500"
                          disabled={rawMaterials.length === 1}
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-gray-700">Name</label>
                          <input
                            type="text"
                            name="nom"
                            value={material.nom}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Origin</label>
                          <input
                            type="text"
                            name="origine"
                            value={material.origine}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Supplier</label>
                          <input
                            type="text"
                            name="fournisseur"
                            value={material.fournisseur}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Purity</label>
                          <input
                            type="text"
                            name="degrePurete"
                            value={material.degrePurete}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Quantity/Unit</label>
                          <input
                            type="text"
                            name="quantiteParUnite"
                            value={material.quantiteParUnite}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Analysis Cert.</label>
                          <input
                            type="text"
                            name="certificatAnalyse"
                            value={material.certificatAnalyse}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Reception Date</label>
                          <input
                            type="date"
                            name="dateReception"
                            value={material.dateReception}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700">Transport</label>
                          <input
                            type="text"
                            name="transport"
                            value={material.transport}
                            onChange={(e) => handleRawMaterialChange(index, e)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={addRawMaterial}
                      className="flex items-center text-blue-600 text-sm"
                    >
                      <Plus size={14} className="mr-1" /> Add Raw Material
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-5/6">
          <div className="w-full">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Assign Medicaments to Boxes</h2>
              <p className="mb-2 text-sm">Current Lot ID: {currentLotId}</p>
              
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Current Conditions</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-700">Temperature</label>
                    <input
                      type="number"
                      name="temperature"
                      value={boxConditions.temperature}
                      onChange={handleBoxConditionsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700">Humidity</label>
                    <input
                      type="number"
                      name="humidite"
                      value={boxConditions.humidite}
                      onChange={handleBoxConditionsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700">Position X</label>
                    <input
                      type="text"
                      name="positionX"
                      value={boxConditions.positionX}
                      onChange={handleBoxConditionsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700">Position Y</label>
                    <input
                      type="text"
                      name="positionY"
                      value={boxConditions.positionY}
                      onChange={handleBoxConditionsChange}
                      className="block w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">CSV File with Medicament IDs</label>
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500
                      file:mr-3 file:py-1 file:px-3
                      file:rounded-md file:border-0
                      file:text-xs file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
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
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  disabled={!selectedFile || transactionStatus === 'pending-assign'}
                >
                  <Upload size={14} className="mr-1" />
                  {transactionStatus === 'pending-assign' ? 'Assigning...' : 'Assign Medicaments'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrentLotId(null)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  Back to Lot Creation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}