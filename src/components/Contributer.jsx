import React, { useState } from 'react';
import { Input, Button, Select, Option, Textarea } from "@material-tailwind/react";
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Truck, Package, ClipboardList, CheckCircle, ChevronRight } from 'lucide-react';

function Distributor() {
  const [shipment, setShipment] = useState({
    shipmentId: '',
    manufacturer: '',
    products: [{
      productId: '',
      name: '',
      batchNumber: '',
      quantity: '',
      expiryDate: ''
    }],
    origin: '',
    destination: '',
    shippingDate: '',
    estimatedDelivery: '',
    storageConditions: {
      temperature: '',
      humidity: ''
    },
    transporter: {
      name: '',
      license: '',
      contact: ''
    },
    status: 'pending'
  });

  const [activeTab, setActiveTab] = useState('ship');
  const [successMessage, setSuccessMessage] = useState("");
  const [currentProductTab, setCurrentProductTab] = useState(0);

  // Sample data for charts
  const distributionData = [
    { name: 'Jan', deliveries: 12 },
    { name: 'Feb', deliveries: 18 },
    { name: 'Mar', deliveries: 15 },
    { name: 'Apr', deliveries: 22 },
    { name: 'May', deliveries: 19 },
    { name: 'Jun', deliveries: 25 },
  ];

  const statusData = [
    { name: 'Delivered', value: 75 },
    { name: 'In Transit', value: 15 },
    { name: 'Pending', value: 10 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProducts = [...shipment.products];
    updatedProducts[index][name] = value;
    setShipment(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  const handleStorageChange = (e) => {
    const { name, value } = e.target;
    setShipment(prev => ({
      ...prev,
      storageConditions: {
        ...prev.storageConditions,
        [name]: value
      }
    }));
  };

  const handleTransporterChange = (e) => {
    const { name, value } = e.target;
    setShipment(prev => ({
      ...prev,
      transporter: {
        ...prev.transporter,
        [name]: value
      }
    }));
  };

  const addProduct = () => {
    setShipment(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          productId: '',
          name: '',
          batchNumber: '',
          quantity: '',
          expiryDate: ''
        }
      ]
    }));
    setCurrentProductTab(shipment.products.length);
  };

  const removeProduct = (index) => {
    if (shipment.products.length <= 1) return;
    
    const updatedProducts = shipment.products.filter((_, i) => i !== index);
    setShipment(prev => ({
      ...prev,
      products: updatedProducts
    }));
    
    if (currentProductTab >= index) {
      setCurrentProductTab(Math.max(0, currentProductTab - 1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Shipment data:', shipment);
    setSuccessMessage(`Shipment ${shipment.shipmentId} recorded successfully!`);
    
    // Reset form
    setShipment({
      shipmentId: '',
      manufacturer: '',
      products: [{
        productId: '',
        name: '',
        batchNumber: '',
        quantity: '',
        expiryDate: ''
      }],
      origin: '',
      destination: '',
      shippingDate: '',
      estimatedDelivery: '',
      storageConditions: {
        temperature: '',
        humidity: ''
      },
      transporter: {
        name: '',
        license: '',
        contact: ''
      },
      status: 'pending'
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
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PharmaDistro</h1>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Distribution Management
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'ship' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('ship')}
          >
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              <span>Manage Shipments</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <div className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              <span>Distribution Analytics</span>
            </div>
          </button>
        </div>

        {activeTab === 'ship' ? (
          /* Shipment Management Form */
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200" style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Shipment Details</h3>
              
              {successMessage && (
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 animate-pulse">
                  <CheckCircle className="h-5 w-5" />
                  <span>{successMessage}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID</label>
                  <Input 
                    size="lg"
                    name="shipmentId"
                    value={shipment.shipmentId}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="e.g. SHIP-2023-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <Input 
                    size="lg"
                    name="manufacturer"
                    value={shipment.manufacturer}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Manufacturer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <Input 
                    size="lg"
                    name="origin"
                    value={shipment.origin}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Source location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <Input 
                    size="lg"
                    name="destination"
                    value={shipment.destination}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Destination location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Date</label>
                  <Input 
                    type="date"
                    size="lg"
                    name="shippingDate"
                    value={shipment.shippingDate}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                  <Input 
                    type="date"
                    size="lg"
                    name="estimatedDelivery"
                    value={shipment.estimatedDelivery}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Products Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-800">Products in Shipment</h4>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
                  >
                    + Add Product
                  </button>
                </div>
                
                {/* Product Tabs */}
                <div className="flex overflow-x-auto mb-4 border-b border-gray-200">
                  {shipment.products.map((_, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 font-medium whitespace-nowrap ${currentProductTab === index ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setCurrentProductTab(index)}
                    >
                      Product {index + 1}
                      {shipment.products.length > 1 && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeProduct(index); }}
                          className="ml-2 text-red-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Current Product Form */}
                {shipment.products.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                      <Input 
                        size="lg"
                        name="productId"
                        value={shipment.products[currentProductTab].productId}
                        onChange={(e) => handleProductChange(e, currentProductTab)}
                        required
                        className="w-full"
                        placeholder="Unique product identifier"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <Input 
                        size="lg"
                        name="name"
                        value={shipment.products[currentProductTab].name}
                        onChange={(e) => handleProductChange(e, currentProductTab)}
                        required
                        className="w-full"
                        placeholder="e.g. Paracetamol 500mg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                      <Input 
                        size="lg"
                        name="batchNumber"
                        value={shipment.products[currentProductTab].batchNumber}
                        onChange={(e) => handleProductChange(e, currentProductTab)}
                        required
                        className="w-full"
                        placeholder="e.g. BATCH-2023-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <Input 
                        type="number"
                        size="lg"
                        name="quantity"
                        value={shipment.products[currentProductTab].quantity}
                        onChange={(e) => handleProductChange(e, currentProductTab)}
                        required
                        className="w-full"
                        placeholder="Number of units"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <Input 
                        type="date"
                        size="lg"
                        name="expiryDate"
                        value={shipment.products[currentProductTab].expiryDate}
                        onChange={(e) => handleProductChange(e, currentProductTab)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Storage Conditions */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Storage Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Requirements (°C)</label>
                    <Input 
                      size="lg"
                      name="temperature"
                      value={shipment.storageConditions.temperature}
                      onChange={handleStorageChange}
                      className="w-full"
                      placeholder="e.g. 15-25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Humidity Requirements (%)</label>
                    <Input 
                      size="lg"
                      name="humidity"
                      value={shipment.storageConditions.humidity}
                      onChange={handleStorageChange}
                      className="w-full"
                      placeholder="e.g. ≤60%"
                    />
                  </div>
                </div>
              </div>
              
              {/* Transporter Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Transporter Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transporter Name</label>
                    <Input 
                      size="lg"
                      name="name"
                      value={shipment.transporter.name}
                      onChange={handleTransporterChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <Input 
                      size="lg"
                      name="license"
                      value={shipment.transporter.license}
                      onChange={handleTransporterChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <Input 
                      size="lg"
                      name="contact"
                      value={shipment.transporter.contact}
                      onChange={handleTransporterChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Shipment Status</h4>
                <div className="w-72">
                  <Select
                    label="Select Status"
                    value={shipment.status}
                    onChange={(value) => setShipment(prev => ({ ...prev, status: value }))}
                  >
                    <Option value="pending">Pending</Option>
                    <Option value="in-transit">In Transit</Option>
                    <Option value="delivered">Delivered</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                >
                  <Package className="mr-2 h-5 w-5" />
                  <span>Record Shipment</span>
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Analytics View */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Deliveries</h3>
                <div className="h-64">
                  <BarChart
                    width={500}
                    height={300}
                    data={distributionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Shipments', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} shipments`, "Count"]} />
                    <Bar dataKey="deliveries" fill="#4f46e5" name="Deliveries" />
                  </BarChart>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Shipment Status</h3>
                <div className="h-64">
                  <PieChart width={500} height={300}>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Shipments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { 
                        id: 'SHIP-2023-045', 
                        manufacturer: 'PharmaFab', 
                        origin: 'Factory A', 
                        destination: 'Warehouse X',
                        products: '3',
                        status: 'Delivered'
                      },
                      { 
                        id: 'SHIP-2023-044', 
                        manufacturer: 'MediCorp', 
                        origin: 'Factory B', 
                        destination: 'Pharmacy Y',
                        products: '2',
                        status: 'In Transit'
                      },
                      { 
                        id: 'SHIP-2023-043', 
                        manufacturer: 'HealthPlus', 
                        origin: 'Factory C', 
                        destination: 'Hospital Z',
                        products: '5',
                        status: 'Pending'
                      },
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.manufacturer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.origin}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.products} products</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            item.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Distributor; 