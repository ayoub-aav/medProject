import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Typography } from "@material-tailwind/react";
import { PlusCircle, CheckCircle, Factory, ClipboardList, FlaskConical, Download, FileText } from 'lucide-react';

function Manufacturer() {
  const [product, setProduct] = useState({
    nomMedicament: '',
    substanceActive: '',
    forme: '',
    dateFabrication: '',
    datePeremption: '',
    nomFabricant: '',
    paysOrigine: '',
    amm: null,
    temperatureMax: '',
    temperatureMin: '',
    humiditeMax: '',
    humiditeMin: '',
    matieresPremieres: [{
      nom: '',
      origine: '',
      fournisseur: '',
      degrePurete: '',
      quantiteParUnite: '',
      certificatAnalyse: null,
      dateReception: '',
      transport: '',
    }],
  });

  const [activeTab, setActiveTab] = useState('add');
  const [successMessage, setSuccessMessage] = useState("");
  const [currentMaterialTab, setCurrentMaterialTab] = useState(0);
  const [productionData, setProductionData] = useState([]);
  
  const [sensorData, setSensorData] = useState({});
  const [timestamp, setTimestamp] = useState(''); // Added state for timestamp

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:1880/manufacturer/sensors');
        const data = await response.json();
        setSensorData(data);
        setTimestamp(data.timestamp); // Set the timestamp from the fetched data
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMaterial = () => {
    setProduct(prev => ({
      ...prev,
      matieresPremieres: [
        ...prev.matieresPremieres,
        {
          nom: '',
          origine: '',
          fournisseur: '',
          degrePurete: '',
          quantiteParUnite: '',
          certificatAnalyse: null,
          dateReception: '',
          transport: '',
        }
      ]
    }));
    setCurrentMaterialTab(product.matieresPremieres.length);
  };

  const handleMaterialChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMaterials = [...product.matieresPremieres];
    updatedMaterials[index][name] = value;

    setProduct(prev => ({
      ...prev,
      matieresPremieres: updatedMaterials
    }));
  };

  const removeMaterial = (index) => {
    if (product.matieresPremieres.length <= 1) return;

    const updatedMaterials = product.matieresPremieres.filter((_, i) => i !== index);
    setProduct(prev => ({
      ...prev,
      matieresPremieres: updatedMaterials
    }));

    if (currentMaterialTab >= index) {
      setCurrentMaterialTab(Math.max(0, currentMaterialTab - 1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProduction = {
      nomMedicament: product.nomMedicament,
      dateFabrication: product.dateFabrication,
      matieresPremieres: product.matieresPremieres.length,
      amm: product.amm ? product.amm.name : 'Aucun',
      certificats: product.matieresPremieres.map(m => m.certificatAnalyse ? m.certificatAnalyse.name : 'Aucun'),
    };

    setProductionData([...productionData, newProduction]);
    setSuccessMessage(`Lot ${product.nomMedicament} enregistré avec succès!`);

    setProduct({
      nomMedicament: '',
      substanceActive: '',
      forme: '',
      dateFabrication: '',
      datePeremption: '',
      nomFabricant: '',
      paysOrigine: '',
      amm: null,
      temperatureMax: '',
      temperatureMin: '',
      humiditeMax: '',
      humiditeMin: '',
      matieresPremieres: [{
        nom: '',
        origine: '',
        fournisseur: '',
        degrePurete: '',
        quantiteParUnite: '',
        certificatAnalyse: null,
        dateReception: '',
        transport: '',
      }],
    });

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Factory className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PharmaFab</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>🌡 {sensorData.temperature || '22°C'}</span>
              <span>💧 {sensorData.humidity || '45%'}</span>
            </div>
            <div className="text-gray-500">
              {new Date(timestamp).toLocaleTimeString('en-MA') || 'N/A'} {/* Display timestamp */}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('add')}
          >
            <div className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              <span>Record Production</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('view')}
          >
            <div className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              <span>Production Analytics</span>
            </div>
          </button>
        </div>

        {activeTab === 'add' ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FlaskConical className="mr-2 h-6 w-6 text-blue-600" />
                <span>Manufacturing Record</span>
              </h3>

              {successMessage && (
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 animate-pulse">
                  <CheckCircle className="h-5 w-5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input fields for product data */}
                {['nomMedicament', 'substanceActive', 'forme', 'dateFabrication', 'datePeremption', 'nomFabricant', 'paysOrigine'].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace(/([A-Z])/g, ' $1').toUpperCase()}*</label>
                    <Input 
                      size="lg"
                      name={field}
                      value={product[field]}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                  </div>
                ))}

                {/* File upload for AMM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AMM (Autorisation de Mise sur le Marché)*</label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setProduct({ ...product, amm: e.target.files[0] })}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    {product.amm && (
                      <span className="ml-2 text-sm text-gray-600 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {product.amm.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Temperature and Humidity Inputs */}
                {['temperatureMax', 'temperatureMin', 'humiditeMax', 'humiditeMin'].map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace(/([A-Z])/g, ' $1').toUpperCase()}*</label>
                    <Input 
                      type="number"
                      size="lg"
                      name={field}
                      value={product[field]}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Matières Premières Section */}
              <div className="flex mt-6">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6">Matières Premières</h4>

                  <div className="flex overflow-x-auto mb-4 border-b border-gray-200">
                    {product.matieresPremieres.map((_, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${currentMaterialTab === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setCurrentMaterialTab(index)}
                      >
                        Matériel {index + 1}
                        {product.matieresPremieres.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeMaterial(index); }}
                            className="ml-2 text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Current Material Form */}
                  {product.matieresPremieres.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom*</label>
                        <Input 
                          size="lg"
                          name="nom"
                          value={product.matieresPremieres[currentMaterialTab].nom}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origine*</label>
                        <Input 
                          size="lg"
                          name="origine"
                          value={product.matieresPremieres[currentMaterialTab].origine}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur*</label>
                        <Input 
                          size="lg"
                          name="fournisseur"
                          value={product.matieresPremieres[currentMaterialTab].fournisseur}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degré de Pureté*</label>
                        <Input 
                          size="lg"
                          name="degrePurete"
                          value={product.matieresPremieres[currentMaterialTab].degrePurete}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité par Unité*</label>
                        <Input 
                          size="lg"
                          name="quantiteParUnite"
                          value={product.matieresPremieres[currentMaterialTab].quantiteParUnite}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificat d'Analyse (PDF)*</label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                          />
                          {product.matieresPremieres[currentMaterialTab].certificatAnalyse && (
                            <span className="ml-2 text-sm text-gray-600 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {product.matieresPremieres[currentMaterialTab].certificatAnalyse.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de Réception*</label>
                        <Input 
                          type="date"
                          size="lg"
                          name="dateReception"
                          value={product.matieresPremieres[currentMaterialTab].dateReception}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport*</label>
                        <Input 
                          size="lg"
                          name="transport"
                          value={product.matieresPremieres[currentMaterialTab].transport}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-6">
                    <Button 
                      type="button"
                      onClick={addMaterial}
                      className="mt-4 inline-flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Ajouter Matière Première
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  <span>Enregistrer la Production</span>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="p-6">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Historique de Production
              </Typography>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médicament</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Fabrication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matières Premières</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificats</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productionData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nomMedicament}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dateFabrication}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.matieresPremieres}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button
                            size="sm"
                            variant="outlined"
                            className="flex items-center gap-1"
                            onClick={() => console.log('Download AMM')}
                          >
                            <Download className="h-4 w-4" />
                            <span className="truncate max-w-xs">{item.amm}</span>
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-2">
                            {item.certificats.map((cert, i) => (
                              <Button
                                key={i}
                                size="sm"
                                variant="outlined"
                                className="flex items-center gap-1"
                                onClick={() => console.log('Download Certificat')}
                              >
                                <Download className="h-4 w-4" />
                                <span className="truncate max-w-xs">{cert}</span>
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {productionData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucune donnée de production disponible
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Manufacturer;