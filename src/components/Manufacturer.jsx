import React, { useState, useEffect } from 'react';
import { initWeb3 } from '../utils/web3Connection_medecin';

function MedicamentLookup() {
  const [web3Instance, setWeb3Instance] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [medicamentId, setMedicamentId] = useState('');
  const [boxId, setBoxId] = useState('');
  const [medicamentDetails, setMedicamentDetails] = useState(null);
  const [boxMedicaments, setBoxMedicaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { web3Instance, contractInstance, accounts } = await initWeb3();
        setWeb3Instance(web3Instance);
        setContractInstance(contractInstance);
        setAccounts(accounts);
      } catch (error) {
        console.error('Failed to connect:', error);
        setError('Failed to connect to blockchain');
      }
    };
    initialize();
  }, []);

  const lookupMedicament = async () => {
    if (!medicamentId || !contractInstance) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractInstance.methods
        .getMedicamentDetails(medicamentId)
        .call({ from: accounts[0] });
      
      setMedicamentDetails({
        unit: {
          medicamentId: result[0].medicamentId,
          lotId: result[0].lotId.toString(),
          conditionsActuelles: {
            temperature: result[0].conditionsActuelles.temperature.toString(),
            humidite: result[0].conditionsActuelles.humidite.toString(),
            positionX: result[0].conditionsActuelles.positionX,
            positionY: result[0].conditionsActuelles.positionY,
            timestamp: new Date(result[0].conditionsActuelles.timestamp * 1000).toLocaleString()
          },
          timestampCreation: new Date(result[0].timestampCreation * 1000).toLocaleString()
        },
        lot: {
          lotId: result[1].lotId.toString(),
          nomMedicament: result[1].nomMedicament,
          substanceActive: result[1].substanceActive,
          forme: result[1].forme,
          dateFabrication: result[1].dateFabrication,
          datePeremption: result[1].datePeremption,
          nomFabricant: result[1].nomFabricant,
          paysOrigine: result[1].paysOrigine,
          amm: result[1].amm,
          timestamp: new Date(result[1].timestamp * 1000).toLocaleString(),
          conditionsConservation: {
            temperatureMax: result[1].conditionsConservation.temperatureMax.toString(),
            temperatureMin: result[1].conditionsConservation.temperatureMin.toString(),
            humiditeMax: result[1].conditionsConservation.humiditeMax.toString(),
            humiditeMin: result[1].conditionsConservation.humiditeMin.toString()
          }
        }
      });
    } catch (err) {
      console.error('Error fetching medicament details:', err);
      setError('Failed to fetch medicament details. Make sure the ID is correct.');
      setMedicamentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const lookupBoxMedicaments = async () => {
    if (!boxId || !contractInstance) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const medicamentIds = await contractInstance.methods
        .getMedicamentsInBox(boxId)
        .call({ from: accounts[0] });
      
      setBoxMedicaments(medicamentIds);
    } catch (err) {
      console.error('Error fetching box medicaments:', err);
      setError('Failed to fetch box medicaments. Make sure the box ID is correct.');
      setBoxMedicaments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Medicament Lookup</h1>
      
      {!accounts.length ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
          No Ethereum accounts connected. Please connect your wallet.
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded-md mb-6">
          Connected account: {accounts[0]}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Lookup by Medicament ID */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Lookup Medicament by ID</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={medicamentId}
              onChange={(e) => setMedicamentId(e.target.value)}
              placeholder="Enter medicament ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            <button
              onClick={lookupMedicament}
              disabled={loading || !medicamentId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>
        </div>

        {/* Lookup Medicaments in Box */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Lookup Medicaments in Box</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
              placeholder="Enter box ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            <button
              onClick={lookupBoxMedicaments}
              disabled={loading || !boxId}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Lookup'}
            </button>
          </div>
        </div>
      </div>

      {/* Medicament Details Display */}
      {medicamentDetails && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Medicament Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Unit Information</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">ID:</span> {medicamentDetails.unit.medicamentId}</p>
                <p><span className="font-semibold">Lot ID:</span> {medicamentDetails.unit.lotId}</p>
                <p><span className="font-semibold">Created:</span> {medicamentDetails.unit.timestampCreation}</p>
              </div>
              
              <h3 className="font-medium mt-4 mb-2">Current Conditions</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Temperature:</span> {medicamentDetails.unit.conditionsActuelles.temperature}°C</p>
                <p><span className="font-semibold">Humidity:</span> {medicamentDetails.unit.conditionsActuelles.humidite}%</p>
                <p><span className="font-semibold">Position:</span> ({medicamentDetails.unit.conditionsActuelles.positionX}, {medicamentDetails.unit.conditionsActuelles.positionY})</p>
                <p><span className="font-semibold">Last Update:</span> {medicamentDetails.unit.conditionsActuelles.timestamp}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Lot Information</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {medicamentDetails.lot.nomMedicament}</p>
                <p><span className="font-semibold">Active Substance:</span> {medicamentDetails.lot.substanceActive}</p>
                <p><span className="font-semibold">Form:</span> {medicamentDetails.lot.forme}</p>
                <p><span className="font-semibold">Manufacturer:</span> {medicamentDetails.lot.nomFabricant}</p>
                <p><span className="font-semibold">Manufacturing Date:</span> {medicamentDetails.lot.dateFabrication}</p>
                <p><span className="font-semibold">Expiration Date:</span> {medicamentDetails.lot.datePeremption}</p>
                <p><span className="font-semibold">Country of Origin:</span> {medicamentDetails.lot.paysOrigine}</p>
                <p><span className="font-semibold">AMM Number:</span> {medicamentDetails.lot.amm}</p>
                <p><span className="font-semibold">Created:</span> {medicamentDetails.lot.timestamp}</p>
              </div>
              
              <h3 className="font-medium mt-4 mb-2">Conservation Conditions</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Temperature Range:</span> {medicamentDetails.lot.conditionsConservation.temperatureMin}°C to {medicamentDetails.lot.conditionsConservation.temperatureMax}°C</p>
                <p><span className="font-semibold">Humidity Range:</span> {medicamentDetails.lot.conditionsConservation.humiditeMin}% to {medicamentDetails.lot.conditionsConservation.humiditeMax}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Box Medicaments Display */}
      {boxMedicaments.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Medicaments in Box {boxId}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {boxMedicaments.map((medId, index) => (
              <div key={index} className="p-3 bg-white rounded border border-gray-200">
                <p className="font-medium">{medId}</p>
                <button
                  onClick={() => {
                    setMedicamentId(medId);
                    lookupMedicament();
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicamentLookup;








































import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, Upload } from 'lucide-react';
import { initWeb3 } from '../utils/web3Connection_medecin';
import { processMedicamentCSVFile } from '../utils/processMedicamentCSV';

function Manufacturer() {
  const [web3Instance, setWeb3Instance] = useState();
  const [contractInstance, setContractInstance] = useState();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRawMaterials, setShowRawMaterials] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLotId, setCurrentLotId] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
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

      for (const boxId in boxMappings) {
        const medicamentIds = boxMappings[boxId];
        
        await contractInstance.methods
          .createAndAssignMedicaments(
            boxId,
            medicamentIds,
            currentLotId,
            conditionsData
          )
          .send({ from: accounts[0] });
      }
      
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Manufacturer Interface</h1>
      
      {!accounts.length ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
          No Ethereum accounts connected. Please connect your wallet.
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-700 rounded-md mb-6">
          Connected account: {accounts[0]}
        </div>
      )}

      {transactionStatus && (
        <div className={`p-4 rounded-md mb-6 ${
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
        <form className="space-y-6">
          {/* Lot Details Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Lot Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                <input
                  type="text"
                  name="nomMedicament"
                  value={lotDetails.nomMedicament}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Active Substance</label>
                <input
                  type="text"
                  name="substanceActive"
                  value={lotDetails.substanceActive}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Form</label>
                <input
                  type="text"
                  name="forme"
                  value={lotDetails.forme}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                <input
                  type="date"
                  name="dateFabrication"
                  value={lotDetails.dateFabrication}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input
                  type="date"
                  name="datePeremption"
                  value={lotDetails.datePeremption}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer Name</label>
                <input
                  type="text"
                  name="nomFabricant"
                  value={lotDetails.nomFabricant}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                <input
                  type="text"
                  name="paysOrigine"
                  value={lotDetails.paysOrigine}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">AMM Number</label>
                <input
                  type="text"
                  name="amm"
                  value={lotDetails.amm}
                  onChange={handleLotDetailsChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Conservation Conditions Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Conservation Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Temperature (°C)</label>
                <input
                  type="number"
                  name="temperatureMax"
                  value={conservation.temperatureMax}
                  onChange={handleConservationChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Temperature (°C)</label>
                <input
                  type="number"
                  name="temperatureMin"
                  value={conservation.temperatureMin}
                  onChange={handleConservationChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Humidity (%)</label>
                <input
                  type="number"
                  name="humiditeMax"
                  value={conservation.humiditeMax}
                  onChange={handleConservationChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Humidity (%)</label>
                <input
                  type="number"
                  name="humiditeMin"
                  value={conservation.humiditeMin}
                  onChange={handleConservationChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Raw Materials Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Raw Materials</h2>
              <button
                type="button"
                onClick={() => setShowRawMaterials(!showRawMaterials)}
                className="flex items-center text-blue-600"
              >
                {showRawMaterials ? (
                  <>Hide <ChevronUp className="ml-1" size={16} /></>
                ) : (
                  <>Show <ChevronDown className="ml-1" size={16} /></>
                )}
              </button>
            </div>
            
            {showRawMaterials && (
              <div className="space-y-6">
                {rawMaterials.map((material, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Raw Material #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeRawMaterial(index)}
                        className="text-red-500"
                        disabled={rawMaterials.length === 1}
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="nom"
                          value={material.nom}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origin</label>
                        <input
                          type="text"
                          name="origine"
                          value={material.origine}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <input
                          type="text"
                          name="fournisseur"
                          value={material.fournisseur}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Purity Degree</label>
                        <input
                          type="text"
                          name="degrePurete"
                          value={material.degrePurete}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity Per Unit</label>
                        <input
                          type="text"
                          name="quantiteParUnite"
                          value={material.quantiteParUnite}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Analysis Certificate</label>
                        <input
                          type="text"
                          name="certificatAnalyse"
                          value={material.certificatAnalyse}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reception Date</label>
                        <input
                          type="date"
                          name="dateReception"
                          value={material.dateReception}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transport</label>
                        <input
                          type="text"
                          name="transport"
                          value={material.transport}
                          onChange={(e) => handleRawMaterialChange(index, e)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addRawMaterial}
                    className="flex items-center text-blue-600"
                  >
                    <Plus size={16} className="mr-1" /> Add Raw Material
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={creerLotMedicament}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!accounts.length || transactionStatus === 'pending'}
            >
              {transactionStatus === 'pending' ? 'Processing...' : 'Create Lot'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Assign Medicaments to Boxes</h2>
            <p className="mb-4">Current Lot ID: {currentLotId}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Conditions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={boxConditions.temperature}
                    onChange={handleBoxConditionsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Humidity (%)</label>
                  <input
                    type="number"
                    name="humidite"
                    value={boxConditions.humidite}
                    onChange={handleBoxConditionsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position X</label>
                  <input
                    type="text"
                    name="positionX"
                    value={boxConditions.positionX}
                    onChange={handleBoxConditionsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position Y</label>
                  <input
                    type="text"
                    name="positionY"
                    value={boxConditions.positionY}
                    onChange={handleBoxConditionsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">CSV File with Medicament IDs</label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAssign}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!selectedFile || transactionStatus === 'pending-assign'}
              >
                <Upload size={16} className="mr-2" />
                {transactionStatus === 'pending-assign' ? 'Assigning...' : 'Assign Medicaments'}
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentLotId(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Lot Creation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Manufacturer;