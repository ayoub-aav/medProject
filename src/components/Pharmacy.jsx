import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Typography } from "@material-tailwind/react";
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { QrCode, Pill, ShoppingCart, ClipboardList, CheckCircle, Camera, CameraOff } from 'lucide-react';
import QrScanner from 'qr-scanner';

function Pharmacy() {
  // State management
  const [activeTab, setActiveTab] = useState('scan');
  const [scanning, setScanning] = useState(false);
  const [scannedMedicines, setScannedMedicines] = useState([]);
  const [cameraState, setCameraState] = useState({
    isActive: false,
    error: null,
    availableCameras: []
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Sample data
  const sampleMedicines = [
    {
      id: 'med-001',
      name: 'Paracetamol 500mg',
      batch: 'BATCH-2023-001',
      quantity: 100,
      expiry: '2025-12-31',
      manufacturer: 'PharmaCorp',
      scannedAt: new Date().toISOString()
    },
    {
      id: 'med-002',
      name: 'Ibuprofen 200mg',
      batch: 'BATCH-2023-002',
      quantity: 50,
      expiry: '2024-06-30',
      manufacturer: 'MediHealth',
      scannedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setScannedMedicines(sampleMedicines);
    checkCameraAvailability();
  }, []);

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

      // Verify video element
      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      // Initialize scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          handleScanResult(result);
        },
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          maxScansPerSecond: 5,
          returnDetailedScanResult: true
        }
      );

      await qrScannerRef.current.start();
      
      setScanning(true);
      setCameraState({
        ...cameraState,
        isActive: true,
        error: null
      });
      setMessage({ text: 'Scanning... Point camera at QR code', type: 'info' });

    } catch (err) {
      console.error('Scanner error:', err);
      setCameraState({
        ...cameraState,
        isActive: false,
        error: err.message
      });
      setMessage({ text: `Scanner error: ${err.message}`, type: 'error' });
      stopScanning();
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
    setCameraState({
      ...cameraState,
      isActive: false
    });
  };

  // Handle scan results
  const handleScanResult = (result) => {
    stopScanning();
    
    // For demo purposes - in real app you would process the QR data
    const randomMed = sampleMedicines[Math.floor(Math.random() * sampleMedicines.length)];
    const newMedicine = {
      ...randomMed,
      scannedAt: new Date().toISOString()
    };

    setScannedMedicines(prev => [newMedicine, ...prev]);
    setMessage({ 
      text: `Scanned: ${newMedicine.name} (${newMedicine.batch})`, 
      type: 'success' 
    });

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Simulate scan for demo
  const simulateScan = () => {
    handleScanResult({ data: JSON.stringify(sampleMedicines[0]) });
  };

  // Clean up
  useEffect(() => {
    return () => stopScanning();
  }, []);

  // Analytics data
  const inventoryData = scannedMedicines.map(med => ({
    name: med.name,
    stock: med.quantity
  }));

  const expiryStatusData = [
    { 
      name: 'Valid', 
      value: scannedMedicines.filter(m => new Date(m.expiry) > new Date()).length 
    },
    { 
      name: 'Expiring Soon', 
      value: scannedMedicines.filter(m => {
        const expiryDate = new Date(m.expiry);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return expiryDate > new Date() && expiryDate <= nextMonth;
      }).length 
    },
    { 
      name: 'Expired', 
      value: scannedMedicines.filter(m => new Date(m.expiry) <= new Date()).length 
    }
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Pill className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">PharmaScan Pro</h1>
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
          <button
            className={`py-3 px-6 font-medium flex items-center ${activeTab === 'scan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('scan')}
          >
            <QrCode className="mr-2 h-5 w-5" />
            Scan Medicine
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Inventory
          </button>
          <button
            className={`py-3 px-6 font-medium flex items-center ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Analytics
          </button>
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
                Medicine Scanner
              </Typography>
              
              {/* Scanner View */}
              <div className="relative w-full aspect-video mb-6 bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef}
                  className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
                  playsInline
                  muted
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
                  <Button
                    onClick={stopScanning}
                    className="flex-1 flex items-center justify-center py-3"
                    color="red"
                  >
                    Stop Scanning
                  </Button>
                )}
              </div>

              {/* Camera Debug Info */}
              <details className="mt-6 text-sm text-gray-600">
                <summary className="cursor-pointer">Camera Information</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                  <p><strong>Status:</strong> {cameraState.isActive ? 'Active' : 'Inactive'}</p>
                  {cameraState.error && <p><strong>Error:</strong> {cameraState.error}</p>}
                  <p><strong>Available Cameras:</strong> {cameraState.availableCameras.length}</p>
                  <ul className="list-disc pl-5 mt-1">
                    {cameraState.availableCameras.map((cam, i) => (
                      <li key={i}>{cam.label || `Camera ${i+1}`}</li>
                    ))}
                  </ul>
                </div>
              </details>

              {/* Recently Scanned */}
              {scannedMedicines.length > 0 && (
                <div className="mt-8">
                  <Typography variant="h5" className="mb-4">
                    Recently Scanned
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scannedMedicines.slice(0, 3).map((medicine, index) => (
                      <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                        <Typography variant="h6" className="mb-2">
                          {medicine.name}
                        </Typography>
                        <div className="space-y-2">
                          <div>
                            <Typography variant="small" className="font-semibold">
                              Batch:
                            </Typography>
                            <Typography variant="small">
                              {medicine.batch}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="small" className="font-semibold">
                              Expiry:
                            </Typography>
                            <Typography variant="small" className={
                              new Date(medicine.expiry) < new Date() ? 'text-red-500' : 'text-green-500'
                            }>
                              {new Date(medicine.expiry).toLocaleDateString()}
                            </Typography>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : activeTab === 'inventory' ? (
          <div className="space-y-6">
            <Card className="p-6 rounded-xl shadow-sm">
              <Typography variant="h3" className="mb-6">
                Medicine Inventory
              </Typography>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scannedMedicines.map((medicine, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {medicine.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.batch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.quantity}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          new Date(medicine.expiry) < new Date() ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {new Date(medicine.expiry).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(medicine.scannedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-sm">
                <Typography variant="h3" className="mb-4">
                  Inventory Levels
                </Typography>
                <div className="h-80">
                  <BarChart
                    width={500}
                    height={300}
                    data={inventoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#4f46e5" />
                  </BarChart>
                </div>
              </Card>

              <Card className="p-6 rounded-xl shadow-sm">
                <Typography variant="h3" className="mb-4">
                  Expiry Status
                </Typography>
                <div className="h-80">
                  <PieChart width={500} height={300}>
                    <Pie
                      data={expiryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expiryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              </Card>
            </div>

            <Card className="p-6 rounded-xl shadow-sm">
              <Typography variant="h3" className="mb-4">
                Expiring Soon (Next 30 Days)
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scannedMedicines
                  .filter(medicine => {
                    const expiryDate = new Date(medicine.expiry);
                    const today = new Date();
                    const nextMonth = new Date();
                    nextMonth.setMonth(today.getMonth() + 1);
                    return expiryDate > today && expiryDate <= nextMonth;
                  })
                  .slice(0, 3)
                  .map((medicine, index) => (
                    <Card key={index} className="p-4 hover:shadow-md">
                      <Typography variant="h6" className="text-yellow-600">
                        {medicine.name}
                      </Typography>
                      <div className="mt-2 space-y-1">
                        <Typography variant="small">
                          <span className="font-semibold">Batch:</span> {medicine.batch}
                        </Typography>
                        <Typography variant="small">
                          <span className="font-semibold">Expiry:</span> {new Date(medicine.expiry).toLocaleDateString()}
                        </Typography>
                        <Typography variant="small">
                          <span className="font-semibold">Qty:</span> {medicine.quantity}
                        </Typography>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pharmacy;