import React, { useState, useEffect } from 'react';
import { initWeb3 } from '../utils/web3Connection_medecin';

function Manufacturer() {
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
        console.log("Connected to contract at:", contractInstance._address);
      } catch (error) {
        console.error('Failed to connect:', error);
        setError('Failed to connect to blockchain');
      }
    };
    initialize();
  }, []);

  // Helper function to convert BigInt to string safely
  const safeToString = (value) => {
    try {
      // Handle BigInt, numbers, and other types
      return value !== undefined && value !== null ? String(value) : '';
    } catch (err) {
      console.error("Error converting value to string:", value, err);
      return '';
    }
  };

  const lookupMedicament = async () => {
    if (!medicamentId || !contractInstance) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Looking up medicament with ID:", medicamentId);
      
      // Get the unit details
      const unit = await contractInstance.methods
        .getMedicamentDetails(medicamentId)
        .call({ from: accounts[0] });
  
      console.log("Retrieved unit data:", unit);
      
      // Check if medicament exists (empty string check for ID)
      if (!unit || unit.medicamentId === "") {
        throw new Error('Medicament not found');
      }
  
      // Get the lot details
      const lot = await contractInstance.methods
        .lots(unit.lotId)
        .call({ from: accounts[0] });
      
      console.log("Retrieved lot data:", lot);
  
      setMedicamentDetails({
        unit: {
          medicamentId: unit.medicamentId,
          lotId: safeToString(unit.lotId),
          conditionsActuelles: {
            temperature: safeToString(unit.conditionsActuelles.temperature),
            humidite: safeToString(unit.conditionsActuelles.humidite),
            positionX: unit.conditionsActuelles.positionX,
            positionY: unit.conditionsActuelles.positionY,
            timestamp: new Date(Number(unit.conditionsActuelles.timestamp) * 1000).toLocaleString()
          },
          timestampCreation: new Date(Number(unit.timestampCreation) * 1000).toLocaleString()
        },
        lot: {
          nomMedicament: lot.nomMedicament,
          substanceActive: lot.substanceActive,
          forme: lot.forme,
          dateFabrication: lot.dateFabrication,
          datePeremption: lot.datePeremption,
          nomFabricant: lot.nomFabricant,
          paysOrigine: lot.paysOrigine,
          amm: lot.amm,
          conditionsConservation: {
            temperatureMax: safeToString(lot.conditionsConservation.temperatureMax),
            temperatureMin: safeToString(lot.conditionsConservation.temperatureMin),
            humiditeMax: safeToString(lot.conditionsConservation.humiditeMax),
            humiditeMin: safeToString(lot.conditionsConservation.humiditeMin)
          }
        }
      });
    } catch (err) {
      console.error('Error fetching medicament details:', err);
      setError(`Medicament not found or error fetching details: ${err.message}`);
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
      console.log("Looking up box with ID:", boxId);
      
      const medicamentIds = await contractInstance.methods
        .getMedicamentsInBox(boxId)
        .call({ from: accounts[0] });
      
      console.log("Box lookup result:", medicamentIds);
      
      setBoxMedicaments(medicamentIds || []);
      
      if (!medicamentIds || medicamentIds.length === 0) {
        setError(`No medicaments found in box ${boxId}`);
      }
    } catch (err) {
      console.error('Error fetching box medicaments:', err);
      setError(`Failed to fetch box medicaments: ${err.message}`);
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
              onChange={(e) => setBoxId(e.target.value.trim())}
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
            {boxMedicaments
              .filter(medId => medId && medId.trim() !== "") // Filter out empty IDs
              .map((medId, index) => (
                <div key={index} className="p-3 bg-white rounded border border-gray-200">
                  <p className="font-medium">{medId}</p>
                  <button
                    onClick={() => {
                      setMedicamentId(medId.trim());
                      // Use a state callback to ensure state is updated before calling lookupMedicament
                      setMedicamentId(medId.trim(), () => {
                        setTimeout(() => lookupMedicament(), 100);
                      });
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

export default Manufacturer;







