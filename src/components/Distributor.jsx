import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button, Card, Typography } from "@material-tailwind/react";
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Truck, Package, ClipboardList, CheckCircle, ChevronRight, QrCode, Camera, CameraOff } from 'lucide-react';
import QrScanner from 'qr-scanner';

// Sample product data that would be retrieved from QR code scan
const sampleProductData = {
  productId: 'PROD-2023-001',
  name: 'Paracetamol 500mg',
  batchNumber: 'BATCH-2023-001',
  quantity: '1000',
  expiryDate: '2025-12-31',
  manufacturer: 'PharmaFab Inc.',
  manufacturingDate: '2023-01-15',
  storageConditions: {
    temperature: '15-25°C',
    humidity: '≤60%'
  },
  ingredients: [
    { name: 'Paracetamol', quantity: '500mg' },
    { name: 'Starch', quantity: '20mg' },
    { name: 'Povidone', quantity: '5mg' }
  ]
};

function Distributor() {
  const [activeTab, setActiveTab] = useState('scan');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraState, setCameraState] = useState({
    isActive: false,
    error: null,
    availableCameras: []
  });
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

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

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      setCameraState({
        ...cameraState,
        availableCameras: cameras,
        error: cameras.length === 0 ? 'No cameras detected' : null
      });
    } catch (err) {
      setCameraState({
        ...cameraState,
        error: 'Could not access camera devices'
      });
    }
  };

  // Start scanning
  const startScanning = async () => {
    try {
      // Verify camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => handleScanResult(result),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          maxScansPerSecond: 5,
          returnDetailedScanResult: true
        }
      );

      await qrScannerRef.current.start();
      
      setScanning(true);
      setCameraState(prev => ({
        ...prev,
        isActive: true,
        error: null
      }));
      setMessage({ text: 'Scanning... Point camera at QR code', type: 'info' });

    } catch (err) {
      let errorMessage = 'Scanner error';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please enable camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera device found.';
      } else {
        errorMessage = `Scanner error: ${err.message}`;
      }
      
      setCameraState(prev => ({
        ...prev,
        isActive: false,
        error: errorMessage
      }));
      setMessage({ text: errorMessage, type: 'error' });
      stopScanning();
    }
  };

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
    setCameraState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  // Handle scan results
  const handleScanResult = useCallback((result) => {
    stopScanning();
    
    try {
      const data = JSON.parse(result.data);
      if (!data.productId || !data.name) {
        throw new Error('Invalid product data format');
      }

      setScannedProduct(data);
      setMessage({ 
        text: `Scanned: ${data.name} (${data.productId})`, 
        type: 'success' 
      });

      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      setMessage({ text: 'Invalid QR code format', type: 'error' });
    }
  }, [stopScanning]);

  // Switch camera
  const switchCamera = async () => {
    if (qrScannerRef.current) {
      try {
        const cameras = await qrScannerRef.current.getCameras();
        if (cameras.length > 1) {
          const currentCamera = qrScannerRef.current.getActiveCamera();
          const newCamera = cameras.find(cam => cam.id !== currentCamera?.id);
          if (newCamera) {
            await qrScannerRef.current.setCamera(newCamera);
            setMessage({ text: 'Camera switched', type: 'info' });
          }
        } else {
          setMessage({ text: 'No alternate camera found', type: 'warning' });
        }
      } catch (err) {
        setMessage({ text: `Could not switch camera: ${err.message}`, type: 'error' });
      }
    }
  };

  // Simulate scan for demo
  const simulateScan = useCallback(() => {
    handleScanResult({ data: JSON.stringify(sampleProductData) });
  }, [handleScanResult]);

  // Clean up
  useEffect(() => {
    checkCameraAvailability();
    return () => stopScanning();
  }, [stopScanning]);

  // Keyboard navigation for tabs
  const handleKeyDown = (e, tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with logo and title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">PharmaDistro</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {cameraState.isActive ? (
              <>
                <Camera className="h-5 w-5 text-green-500" />
                <span>Camera Active</span>
              </>
            ) : (
              <>
                <CameraOff className="h-5 w-5 text-red-500" />
                <span>Camera Inactive</span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {['scan', 'analytics'].map((tab) => (
            <button
              key={tab}
              className={`py-3 px-6 font-medium flex items-center ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(e) => handleKeyDown(e, tab)}
              role="tab"
              aria-selected={activeTab === tab}
              tabIndex={0}
            >
              {tab === 'scan' && <QrCode className="mr-2 h-5 w-5" />}
              {tab === 'analytics' && <ClipboardList className="mr-2 h-5 w-5" />}
              {tab === 'scan' && 'Scan Product'}
              {tab === 'analytics' && 'Distribution Analytics'}
            </button>
          ))}
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-3 rounded-lg ${
            message.type === 'error' ? 'bg-red-50 text-red-700' :
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'error' ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'scan' ? (
          <Card className="p-6 rounded-xl shadow-sm">
            <div className="space-y-8">
              <Typography variant="h3" className="flex items-center mb-6">
                <QrCode className="mr-2 h-6 w-6 text-blue-600" />
                Product Scanner
              </Typography>
              
              {/* Scanner View */}
              <div 
                className="relative w-full aspect-video mb-6 bg-black rounded-lg overflow-hidden"
                role="region"
                aria-live="polite"
                aria-label="QR Scanner View"
              >
                <video 
                  ref={videoRef}
                  className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                  aria-label="Camera preview"
                />
                
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-70">
                    <QrCode className="h-24 w-24 opacity-50 mb-4" />
                    <Typography className="text-lg opacity-75">
                      {cameraState.error ? cameraState.error : 'Camera preview will appear when scanning'}
                    </Typography>
                  </div>
                )}
                
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-blue-400 border-dashed rounded-lg w-64 h-64 animate-pulse opacity-70"></div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!scanning ? (
                  <>
                    <Button
                      onClick={startScanning}
                      className="flex-1 flex items-center justify-center gap-2 py-3"
                      color="blue"
                      disabled={!!cameraState.error}
                    >
                      <QrCode className="h-5 w-5" />
                      Start Scanning
                    </Button>
                    <Button
                      onClick={simulateScan}
                      variant="outlined"
                      className="flex-1 flex items-center justify-center py-3"
                      color="blue"
                    >
                      Simulate Scan
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={stopScanning}
                      className="flex-1 flex items-center justify-center py-3"
                      color="red"
                    >
                      Stop Scanning
                    </Button>
                    {cameraState.availableCameras.length > 1 && (
                      <Button
                        onClick={switchCamera}
                        variant="outlined"
                        className="flex-1 flex items-center justify-center py-3"
                        color="blue"
                      >
                        Switch Camera
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Scanned Product Details */}
              {scannedProduct && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-bold text-gray-800">Product Details</h4>
                    <Button 
                      variant="outlined" 
                      onClick={() => setScannedProduct(null)}
                      className="flex items-center"
                    >
                      <span>Scan Another</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <Typography variant="h6" color="blue-gray" className="mb-4 border-b pb-2">
                        Basic Information
                      </Typography>
                      <div className="space-y-4">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Product ID
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.productId}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Product Name
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.name}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Batch Number
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.batchNumber}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Quantity
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.quantity} units
                          </Typography>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <Typography variant="h6" color="blue-gray" className="mb-4 border-b pb-2">
                        Manufacturing Details
                      </Typography>
                      <div className="space-y-4">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Manufacturer
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.manufacturer}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Manufacturing Date
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.manufacturingDate}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Expiry Date
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            {scannedProduct.expiryDate}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Storage Conditions
                          </Typography>
                          <Typography color="gray" className="font-normal">
                            Temp: {scannedProduct.storageConditions.temperature}, 
                            Humidity: {scannedProduct.storageConditions.humidity}
                          </Typography>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6 md:col-span-2">
                      <Typography variant="h6" color="blue-gray" className="mb-4 border-b pb-2">
                        Ingredients
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scannedProduct.ingredients.map((ingredient, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              {ingredient.name}
                            </Typography>
                            <Typography color="gray" className="font-normal">
                              {ingredient.quantity}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
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