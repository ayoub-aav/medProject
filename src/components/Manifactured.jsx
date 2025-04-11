import React, {useState, useEffect} from 'react'
import Web3 from 'web3';
import { initWeb3 } from '../utils/web3Connection_User';
import { ClipboardCheck, CloudLightning, Layers, Box } from 'lucide-react'

function Manifactured() {
    const[web3Instance, setWeb3Instance]= useState();
    const[contractInstance, setContractInstance]= useState();
    const[accounts, setAccounts]= useState();





    useEffect(()=>{
        const load = async ()=>{

        const{ web3Instance, contractInstance, accounts }= await initWeb3();
        setWeb3Instance(web3Instance);
        setContractInstance(contractInstance);
        setAccounts(accounts);
        }

        load();
    }, []);

    const addMedecinsOut = async ()=>{

    };






    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
          <div className="mb-8">
              <div className="flex items-center mb-4">
                  <ClipboardCheck className="text-blue-500 mr-2" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Informations du Médicament</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nom du médicament" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Substance active" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Forme" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Date de fabrication" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Date de péremption" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nom du fabricant" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Pays d'origine" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Code produit" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="AMM" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Température max" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Température min" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Humidité max" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Humidité min" />
                  </div>
              </div>
          </div>

          <div className="mb-8">
              <div className="flex items-center mb-4">
                  <Layers className="text-green-600 mr-2" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Matière Première</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Nom" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Origine" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Fournisseur" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Degré de pureté" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Quantité par unité" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Certificat d'analyse" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Date de réception" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Transport" />
                  </div>
              </div>
          </div>

          <div className="mb-8">
              <div className="flex items-center mb-4">
                  <CloudLightning className="text-purple-600 mr-2" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Conditions Actuelles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Température actuelle" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Humidité actuelle" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Position X" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Position Y" />
                  </div>
                  <div className="relative">
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="Timestamp" />
                  </div>
              </div>
          </div>

          <div className="mt-8">
              <div className="flex items-center gap-4">
                  <input className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="ID du Médicament" />
                  <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center">
                      <Box className="mr-2" size={20} />
                      Enregistrer
                  </button>
              </div>
          </div>
      </div>
  )
}

export default Manifactured
