import React, { useEffect, useState } from 'react';
import { Upload, ChevronDown, ChevronUp, Plus, Minus, FileSpreadsheet } from 'lucide-react';
import { initWeb3 } from '../utils/web3Connection_medecin';


function Manufacturer() {
  const [web3Instance, setWeb3Instance] = useState();
  const [contractInstance, setContractInstance] = useState();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCsvData] = useState(null);
  
  // Form states
  const [showRawMaterials, setShowRawMaterials] = useState(false);
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
  
  const [conservation, setConservation] = useState({
    temperatureMax: "",
    temperatureMin: "",
    humiditeMax: "",
    humiditeMin: ""
  });
  
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
        // Assuming initWeb3 is defined in an external module
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
    // Store as string instead of parsing to integer immediately
    setConservation(prev => ({ ...prev, [name]: value }));
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

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target.result;
      // Parse CSV content
      const parsedData = parseCSV(csvContent);
      setCsvData(parsedData);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const values = lines[i].split(',');
      
      // Assuming first column is medicamentId and second column is boxId
      if (values.length >= 2) {
        result.push({
          medicamentId: values[0].trim(),
          boxId: values[1].trim()
        });
      }
    }
    
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contractInstance || !accounts.length) {
      alert("Web3 not initialized or no accounts available");
      return;
    }

    try {
      // In handleSubmit, ensure numbers are properly converted
      const result = await contractInstance.methods.creerLotMedicament(
        lotDetails,
        {
          temperatureMax: parseInt(conservation.temperatureMax),
          temperatureMin: parseInt(conservation.temperatureMin),
          humiditeMax: parseInt(conservation.humiditeMax),
          humiditeMin: parseInt(conservation.humiditeMin)
        },
        rawMaterials
      ).send({ from: accounts[0] });
      
      console.log("Lot created:", result);
      alert(`Lot created successfully with ID: ${result.events.LotCree.returnValues.lotId}`);
      
      // If CSV data is available, process it
      if (csvData && csvData.length > 0) {
        processCSVData(result.events.LotCree.returnValues.lotId);
      }
    } catch (error) {
      console.error("Error creating lot:", error);
      alert("Failed to create lot. See console for details.");
    }
  };
  
  const processCSVData = async (lotId) => {
    try {
      // Group medicamentIds by boxId
      const boxGroups = {};
      csvData.forEach(item => {
        if (!boxGroups[item.boxId]) {
          boxGroups[item.boxId] = [];
        }
        boxGroups[item.boxId].push(item.medicamentId);
      });
      
      // Create all medicine units first
      const allMedicamentIds = csvData.map(item => item.medicamentId);
      const conditions = {
        temperature: 20,
        humidite: 50,
        positionX: "0",
        positionY: "0",
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      await contractInstance.methods.createMedicamentUnits(
        allMedicamentIds,
        lotId,
        conditions
      ).send({ from: accounts[0] });
      
      // Assign medicines to boxes
      for (const boxId in boxGroups) {
        await contractInstance.methods.assignMedicamentsToBox(
          boxId,
          boxGroups[boxId]
        ).send({ from: accounts[0] });
      }
      
      alert("CSV data processed successfully!");
    } catch (error) {
      console.error("Error processing CSV data:", error);
      alert("Failed to process CSV data. See console for details.");
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        {/* CSV Upload Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">CSV Upload</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload a CSV file containing the medicament IDs and box IDs. 
            The CSV should have two columns: first column for medicament ID, second column for box ID.
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center">
                  <FileSpreadsheet size={18} className="mr-2 text-green-600" />
                  <span>Choose CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
                {csvData && (
                  <span className="ml-3 text-sm text-green-600">
                    {csvData.length} entries loaded
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!accounts.length}
          >
            Create Lot and Process Data
          </button>
        </div>
      </form>
    </div>
  );
}

export default Manufacturer;