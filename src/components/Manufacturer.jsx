import React, { useState } from 'react';
import { Input, Button, Textarea } from "@material-tailwind/react";
import { PlusCircle, CheckCircle, Factory, ClipboardList, FlaskConical } from 'lucide-react';

function Manufacturer() {
  const [product, setProduct] = useState({
    nomMedicament: '',
    substanceActive: '',
    forme: '',
    dateFabrication: '',
    datePeremption: '',
    nomFabricant: '',
    paysOrigine: '',
    amm: '',
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
      certificatAnalyse: '',
      dateReception: '',
      transport: ''
    }]
  });

  const [activeTab, setActiveTab] = useState('add');
  const [successMessage, setSuccessMessage] = useState("");
  const [currentMaterialTab, setCurrentMaterialTab] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
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
          certificatAnalyse: '',
          dateReception: '',
          transport: ''
        }
      ]
    }));
    setCurrentMaterialTab(product.matieresPremieres.length);
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
    setSuccessMessage(`Production batch ${product.nomMedicament} recorded successfully!`);
    
    // Reset form
    setProduct({
      nomMedicament: '',
      substanceActive: '',
      forme: '',
      dateFabrication: '',
      datePeremption: '',
      nomFabricant: '',
      paysOrigine: '',
      amm: '',
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
        certificatAnalyse: '',
        dateReception: '',
        transport: ''
      }]
    });
    
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
      <div className="w-full max-w-7xl">
        {/* Header with logo and title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Factory className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PharmaFab</h1>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manufacturing Control Panel
          </h2>
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
          /* Add Production Form */
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Médicament*</label>
                  <Input 
                    size="lg"
                    name="nomMedicament"
                    value={product.nomMedicament}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Substance Active*</label>
                  <Input 
                    size="lg"
                    name="substanceActive"
                    value={product.substanceActive}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forme*</label>
                  <Input 
                    size="lg"
                    name="forme"
                    value={product.forme}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="e.g. Comprimé, Gélule, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fabrication*</label>
                  <Input 
                    type="date"
                    size="lg"
                    name="dateFabrication"
                    value={product.dateFabrication}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de Péremption*</label>
                  <Input 
                    type="date"
                    size="lg"
                    name="datePeremption"
                    value={product.datePeremption}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Fabricant*</label>
                  <Input 
                    size="lg"
                    name="nomFabricant"
                    value={product.nomFabricant}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays d'Origine*</label>
                  <Input 
                    size="lg"
                    name="paysOrigine"
                    value={product.paysOrigine}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AMM (Autorisation de Mise sur le Marché)*</label>
                  <Input 
                    size="lg"
                    name="amm"
                    value={product.amm}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Température Max (°C)*</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="temperatureMax"
                    value={product.temperatureMax}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Température Min (°C)*</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="temperatureMin"
                    value={product.temperatureMin}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidité Max (%)*</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="humiditeMax"
                    value={product.humiditeMax}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidité Min (%)*</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="humiditeMin"
                    value={product.humiditeMin}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificat d'Analyse*</label>
                        <Input 
                          size="lg"
                          name="certificatAnalyse"
                          value={product.matieresPremieres[currentMaterialTab].certificatAnalyse}
                          onChange={(e) => handleMaterialChange(e, currentMaterialTab)}
                          required
                          className="w-full"
                        />
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
          /* Analytics View */
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Production Analytics</h3>
            <p className="text-gray-600">This section would display production analytics if connected to the smart contract.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Manufacturer;