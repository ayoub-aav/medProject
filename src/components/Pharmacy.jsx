import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Option, Textarea, Card } from "@material-tailwind/react";
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ShoppingCart, Pill, ClipboardList, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import Web3 from 'web3';
import { initWeb3 } from '../utils/web3Connection_User';

function Pharmacy() {
  // Blockchain state
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [userAccount, setUserAccount] = useState("");
  const [loading, setLoading] = useState(false);

  // Pharmacy state
  const [inventory, setInventory] = useState([]);
  const [receivedShipments, setReceivedShipments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [newMedicine, setNewMedicine] = useState({
    productId: '',
    name: '',
    batchNumber: '',
    quantity: '',
    price: '',
    expiryDate: '',
    manufacturer: ''
  });

  const [prescription, setPrescription] = useState({
    prescriptionId: '',
    patientId: '',
    doctorId: '',
    medicines: [],
    date: '',
    filled: false
  });

  // Initialize Web3 and contract
  const initBlockchain = async () => {
    try {
      setLoading(true);
      const { web3Instance, contractInstance, accounts } = await initWeb3();
      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccounts(accounts);
      setUserAccount(accounts[0]);

      // Load pharmacy data
      await loadInventory(contractInstance, accounts[0]);
      await loadReceivedShipments(contractInstance, accounts[0]);
      await loadPrescriptions(contractInstance, accounts[0]);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error initializing blockchain:", error);
      setLoading(false);
      return false;
    }
  };

  // Load inventory from blockchain
  const loadInventory = async (contractInstance, account) => {
    try {
      const inventoryCount = await contractInstance.methods.getInventoryCount().call({ from: account });
      const loadedInventory = [];
      
      for (let i = 0; i < inventoryCount; i++) {
        const item = await contractInstance.methods.getInventoryItem(i).call({ from: account });
        loadedInventory.push({
          productId: item.productId,
          name: item.name,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          price: item.price,
          expiryDate: new Date(item.expiryDate * 1000).toISOString().split('T')[0],
          manufacturer: item.manufacturer
        });
      }
      
      setInventory(loadedInventory);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  };

  // Load received shipments from blockchain
  const loadReceivedShipments = async (contractInstance, account) => {
    try {
      const shipmentCount = await contractInstance.methods.getReceivedShipmentCount().call({ from: account });
      const loadedShipments = [];
      
      for (let i = 0; i < shipmentCount; i++) {
        const shipment = await contractInstance.methods.getReceivedShipment(i).call({ from: account });
        loadedShipments.push({
          shipmentId: shipment.shipmentId,
          manufacturer: shipment.manufacturer,
          products: shipment.products,
          receivedDate: new Date(shipment.receivedDate * 1000).toISOString().split('T')[0],
          status: shipment.status
        });
      }
      
      setReceivedShipments(loadedShipments);
    } catch (error) {
      console.error("Error loading shipments:", error);
    }
  };

  // Load prescriptions from blockchain
  const loadPrescriptions = async (contractInstance, account) => {
    try {
      const prescriptionCount = await contractInstance.methods.getPrescriptionCount().call({ from: account });
      const loadedPrescriptions = [];
      
      for (let i = 0; i < prescriptionCount; i++) {
        const prescription = await contractInstance.methods.getPrescription(i).call({ from: account });
        loadedPrescriptions.push({
          prescriptionId: prescription.prescriptionId,
          patientId: prescription.patientId,
          doctorId: prescription.doctorId,
          medicines: prescription.medicines,
          date: new Date(prescription.date * 1000).toISOString().split('T')[0],
          filled: prescription.filled
        });
      }
      
      setPrescriptions(loadedPrescriptions);
    } catch (error) {
      console.error("Error loading prescriptions:", error);
    }
  };

  // Add medicine to inventory
  const addMedicineToInventory = async () => {
    try {
      setLoading(true);
      
      await contract.methods.addToInventory(
        newMedicine.productId,
        newMedicine.name,
        newMedicine.batchNumber,
        newMedicine.quantity,
        newMedicine.price,
        Math.floor(new Date(newMedicine.expiryDate).getTime() / 1000),
        newMedicine.manufacturer
      ).send({ from: accounts[0] });
      
      setSuccessMessage(`Medicine ${newMedicine.name} added to inventory!`);
      await loadInventory(contract, accounts[0]);
      
      // Reset form
      setNewMedicine({
        productId: '',
        name: '',
        batchNumber: '',
        quantity: '',
        price: '',
        expiryDate: '',
        manufacturer: ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error adding medicine:", error);
      setLoading(false);
    }
  };

  // Record received shipment
  const recordReceivedShipment = async (shipmentId) => {
    try {
      setLoading(true);
      await contract.methods.recordShipmentReceipt(shipmentId)
        .send({ from: accounts[0] });
      
      setSuccessMessage(`Shipment ${shipmentId} marked as received!`);
      await loadReceivedShipments(contract, accounts[0]);
      await loadInventory(contract, accounts[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error recording shipment receipt:", error);
      setLoading(false);
    }
  };

  // Fill prescription
  const fillPrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      await contract.methods.fillPrescription(prescriptionId)
        .send({ from: accounts[0] });
      
      setSuccessMessage(`Prescription ${prescriptionId} filled!`);
      await loadPrescriptions(contract, accounts[0]);
      await loadInventory(contract, accounts[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error filling prescription:", error);
      setLoading(false);
    }
  };

  // Handle form changes
  const handleMedicineInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine(prev => ({ ...prev, [name]: value }));
  };

  const handlePrescriptionInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value }));
  };

  // Initialize on component mount
  useEffect(() => {
    initBlockchain();
  }, []);

  // Sample data for charts
  const inventoryData = [
    { name: 'Jan', stock: 1200 },
    { name: 'Feb', stock: 1900 },
    { name: 'Mar', stock: 1500 },
    { name: 'Apr', stock: 1800 },
    { name: 'May', stock: 2100 },
    { name: 'Jun', stock: 1700 },
  ];

  const prescriptionData = [
    { name: 'Filled', value: prescriptions.filter(p => p.filled).length },
    { name: 'Pending', value: prescriptions.filter(p => !p.filled).length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
      <div className="w-full max-w-7xl">
        {/* Header with logo and title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Pill className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PharmaCare</h1>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pharmacy Dashboard
            </h2>
            <p className="text-sm font-mono text-gray-600 mt-1">
              {userAccount?.slice(0, 8)}...{userAccount?.slice(-6)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <div className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span>Inventory</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'shipments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('shipments')}
          >
            <div className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              <span>Shipments</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'prescriptions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            <div className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              <span>Prescriptions</span>
            </div>
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 animate-pulse">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === 'inventory' ? (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Medicine to Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <Input 
                    size="lg"
                    name="productId"
                    value={newMedicine.productId}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <Input 
                    size="lg"
                    name="name"
                    value={newMedicine.name}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <Input 
                    size="lg"
                    name="batchNumber"
                    value={newMedicine.batchNumber}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="quantity"
                    value={newMedicine.quantity}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETH)</label>
                  <Input 
                    type="number"
                    size="lg"
                    name="price"
                    value={newMedicine.price}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <Input 
                    type="date"
                    size="lg"
                    name="expiryDate"
                    value={newMedicine.expiryDate}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <Input 
                    size="lg"
                    name="manufacturer"
                    value={newMedicine.manufacturer}
                    onChange={handleMedicineInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button 
                    onClick={addMedicineToInventory}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                  >
                    <Pill className="mr-2 h-5 w-5" />
                    <span>Add to Inventory</span>
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Inventory Levels</h3>
                <div className="h-64">
                  <BarChart
                    width={500}
                    height={300}
                    data={inventoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} units`, "Stock"]} />
                    <Bar dataKey="stock" fill="#4f46e5" name="Stock" />
                  </BarChart>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Medicine Expiry</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {inventory
                    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">Batch: {item.batchNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            new Date(item.expiryDate) < new Date() ? 'text-red-500' : 
                            new Date(item.expiryDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{item.quantity} units</p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Inventory</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{item.productId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.batchNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price} ETH</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          new Date(item.expiryDate) < new Date() ? 'text-red-500' : 
                          new Date(item.expiryDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : activeTab === 'shipments' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Shipments</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {receivedShipments.map((shipment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800">Shipment: {shipment.shipmentId}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          shipment.status === 'received' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">From: {shipment.manufacturer}</p>
                      <p className="text-sm text-gray-600 mb-3">Received: {shipment.receivedDate}</p>
                      <div className="border-t border-gray-200 pt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Products:</h5>
                        <ul className="space-y-2">
                          {shipment.products.slice(0, 2).map((product, pIndex) => (
                            <li key={pIndex} className="text-sm text-gray-600">
                              {product.name} (Batch: {product.batchNumber}, Qty: {product.quantity})
                            </li>
                          ))}
                          {shipment.products.length > 2 && (
                            <li className="text-sm text-gray-500">+ {shipment.products.length - 2} more products</li>
                          )}
                        </ul>
                      </div>
                      {shipment.status !== 'received' && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => recordReceivedShipment(shipment.shipmentId)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Mark as Received
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Shipment Statistics</h3>
                <div className="h-64">
                  <PieChart width={500} height={300}>
                    <Pie
                      data={[
                        { name: 'Received', value: receivedShipments.filter(s => s.status === 'received').length },
                        { name: 'In Transit', value: receivedShipments.filter(s => s.status === 'in-transit').length },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell key="cell-received" fill="#10b981" />
                      <Cell key="cell-transit" fill="#3b82f6" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} shipments`, "Count"]} />
                  </PieChart>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Prescription Status</h3>
                <div className="h-64">
                  <PieChart width={500} height={300}>
                    <Pie
                      data={prescriptionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell key="cell-filled" fill="#10b981" />
                      <Cell key="cell-pending" fill="#f59e0b" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} prescriptions`, "Count"]} />
                  </PieChart>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Prescriptions</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {prescriptions.slice(0, 5).map((prescription, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800">Prescription #{prescription.prescriptionId}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          prescription.filled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.filled ? 'Filled' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Patient: {prescription.patientId}</p>
                      <p className="text-sm text-gray-600 mb-3">Doctor: {prescription.doctorId}</p>
                      <div className="border-t border-gray-200 pt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Medicines:</h5>
                        <ul className="space-y-1">
                          {prescription.medicines.slice(0, 3).map((medicine, mIndex) => (
                            <li key={mIndex} className="text-sm text-gray-600">
                              {medicine.name} (Qty: {medicine.quantity})
                            </li>
                          ))}
                          {prescription.medicines.length > 3 && (
                            <li className="text-sm text-gray-500">+ {prescription.medicines.length - 3} more medicines</li>
                          )}
                        </ul>
                      </div>
                      {!prescription.filled && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => fillPrescription(prescription.prescriptionId)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Fill Prescription
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">All Prescriptions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">#{prescription.prescriptionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.patientId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.doctorId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.medicines.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            prescription.filled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {prescription.filled ? 'Filled' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {!prescription.filled && (
                            <button 
                              onClick={() => fillPrescription(prescription.prescriptionId)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Fill
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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

export default Pharmacy;