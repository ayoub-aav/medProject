import React, { useState, useEffect, useRef } from 'react';
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { QrCode, Pill, ShoppingCart, ClipboardList, CheckCircle, Camera, CameraOff } from 'lucide-react';

function Pharmacy() {
  // State management
  const [activeTab, setActiveTab] = useState('scan');
  const [scanning, setScanning] = useState(false);
  const [scannedMedicines, setScannedMedicines] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [timestamp, setTimestamp] = useState('');
  const [cameraState, setCameraState] = useState({
    isActive: false,
    error: null,
    availableCameras: []
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const videoRef = useRef(null);

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

  // Initialize with sample data and fetch sensor data
  useEffect(() => {
    setScannedMedicines(sampleMedicines);
    checkCameraAvailability();
    fetchSensorData(); // Fetch sensor data
  }, []);

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setCameraState({
          ...cameraState,
          error: 'Camera API not supported in this browser'
        });
        return;
      }

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

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      const response = await fetch('http://localhost:1880/pharmacy/sensors'); // Update URL as needed
      const data = await response.json();
      setSensorData(data);
      setTimestamp(data.timestamp); // Set timestamp
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  // Start scanning
  const startScanning = async () => {
    try {
      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      // Try to get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        setCameraState({
          ...cameraState,
          isActive: true,
          error: null
        });
      } catch (err) {
        throw new Error(`Could not access camera: ${err.message}`);
      }

      setScanning(true);
      setMessage({ text: 'Scanning... Point camera at QR code', type: 'info' });

      // Simulate finding a QR code after 3 seconds (for demo purposes)
      setTimeout(() => {
        handleScanResult({});
      }, 3000);

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
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
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
      id: `med-${Math.floor(Math.random() * 1000)}`,
      scannedAt: new Date().toISOString()
    };

    setScannedMedicines(prev => [newMedicine, ...prev]);
    setMessage({
      text: `Scanned: ${newMedicine.name} (${newMedicine.batch})`,
      type: 'success'
    });

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>🌡 {sensorData.temperature || '22°C'}</span>
              <span>💧 {sensorData.humidity || '45%'}</span>
            </div>
            <div className="text-gray-500">
              {timestamp ? new Date(timestamp).toLocaleTimeString('en-MA') : 'N/A'}
            </div>
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
          <div className="p-6 rounded-xl shadow-sm bg-white">
            <div className="space-y-8">
              <h3 className="flex items-center mb-6 text-xl font-bold">
                <QrCode className="mr-2 h-6 w-6 text-blue-600" />
                Medicine Scanner
              </h3>
              
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
                    <p className="text-lg opacity-75">
                      {cameraState.error ? cameraState.error : 'Camera preview will appear when scanning'}
                    </p>
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
                    <button
                      onClick={startScanning}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                      disabled={!!cameraState.error}
                    >
                      <QrCode className="h-5 w-5" />
                      Start Scanning
                    </button>
                    <button
                      onClick={() => handleScanResult({})} // Simulate scan
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Simulate Scan
                    </button>
                  </>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex-1 flex items-center justify-center py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Stop Scanning
                  </button>
                )}
              </div>

              {/* Recently Scanned */}
              {scannedMedicines.length > 0 && (
                <div className="mt-8">
                  <h5 className="mb-4 text-lg font-semibold">
                    Recently Scanned
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scannedMedicines.slice(0, 3).map((medicine, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <h6 className="mb-2 font-semibold">
                          {medicine.name}
                        </h6>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-semibold">
                              Batch:
                            </span>
                            <span className="text-sm ml-1">
                              {medicine.batch}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold">
                              Expiry:
                            </span>
                            <span className={`text-sm ml-1 ${
                              new Date(medicine.expiry) < new Date() ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {new Date(medicine.expiry).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="space-y-6">
            <div className="p-6 rounded-xl shadow-sm bg-white">
              <h3 className="mb-6 text-xl font-bold">
                Medicine Inventory
              </h3>
              
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
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl shadow-sm bg-white">
                <h3 className="mb-4 text-xl font-bold">
                  Inventory Levels
                </h3>
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
              </div>

              <div className="p-6 rounded-xl shadow-sm bg-white">
                <h3 className="mb-4 text-xl font-bold">
                  Expiry Status
                </h3>
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
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-sm bg-white">
              <h3 className="mb-4 text-xl font-bold">
                Expiring Soon (Next 30 Days)
              </h3>
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
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                      <h6 className="text-yellow-600 font-medium">
                        {medicine.name}
                      </h6>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="font-semibold">Batch:</span> {medicine.batch}
                        </p>
                        <p>
                          <span className="font-semibold">Expiry:</span> {new Date(medicine.expiry).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-semibold">Qty:</span> {medicine.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pharmacy;