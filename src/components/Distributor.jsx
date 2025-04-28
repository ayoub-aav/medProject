import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Typography } from "@material-tailwind/react";
import { BarChart, PieChart, Bar, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Truck, ClipboardList, CheckCircle, ChevronRight, QrCode, Camera, CameraOff } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker configuration
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

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
    humidity: '≤60%',
  },
  ingredients: [
    { name: 'Paracetamol', quantity: '500mg' },
    { name: 'Starch', quantity: '20mg' },
    { name: 'Povidone', quantity: '5mg' },
  ],
};

function Distributor() {
  const [activeTab, setActiveTab] = useState('scan');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraState, setCameraState] = useState({
    isActive: false,
    error: null,
    availableCameras: [],
  });
  const [sensorData, setSensorData] = useState({});
  const [timestamp, setTimestamp] = useState('');
  const [geoPosition, setGeoPosition] = useState({ 
    latitude: 31.6295, // Default to Marrakech coordinates
    longitude: -7.9811
  });

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Fetch sensor data from Node-RED
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:1880/Distributor/sensors');
        const data = await response.json();
        
        setSensorData(data);
        setTimestamp(data.timestamp);
        
        setGeoPosition(prev => {
          const latDiff = Math.abs(prev.latitude - data.geoPosition.latitude);
          const lngDiff = Math.abs(prev.longitude - data.geoPosition.longitude);
          return (latDiff > 0.0009 || lngDiff > 0.0009) ? data.geoPosition : prev;
        });

      } catch (error) {
        console.error('Sensor data error:', error);
        // Fallback to random Moroccan coordinates
        setGeoPosition(prev => ({
          latitude: prev.latitude + (Math.random() * 0.02 - 0.01),
          longitude: prev.longitude + (Math.random() * 0.02 - 0.01)
        }));
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // QR Scanner functions
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => handleScanResult(result),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          maxScansPerSecond: 5,
        }
      );

      await qrScannerRef.current.start();
      setScanning(true);
      setCameraState(prev => ({ ...prev, isActive: true, error: null }));
      setMessage({ text: 'Scanning... Point camera at QR code', type: 'info' });
    } catch (err) {
      setMessage({ text: 'Camera access denied', type: 'error' });
      setCameraState(prev => ({ ...prev, isActive: false }));
    }
  };

  const stopScanning = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleScanResult = useCallback((result) => {
    stopScanning();
    try {
      const data = JSON.parse(result.data);
      if (!data.productId) throw new Error('Invalid QR');
      
      setScannedProduct(data);
      setMessage({ text: `Scanned: ${data.name}`, type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      setMessage({ text: 'Invalid QR code', type: 'error' });
    }
  }, [stopScanning]);

  // Analytics data
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Truck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">PharmaDistro</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>🌡 {sensorData.temperature || '22°C'}</span>
              <span>💧 {sensorData.humidity || '45%'}</span>
            </div>
            <div className="text-gray-500">
              {new Date(timestamp).toLocaleTimeString('en-MA')}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {['scan', 'analytics'].map((tab) => (
            <button
              key={tab}
              className={`py-3 px-6 font-medium flex items-center ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'scan' ? (
                <><QrCode className="mr-2 h-5 w-5" />Scan Product</>
              ) : (
                <><ClipboardList className="mr-2 h-5 w-5" />Analytics</>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'scan' ? (
          <Card className="p-6 rounded-xl shadow-sm">
            {/* Scanner Section */}
            <div className="mb-8">
              <Typography variant="h5" className="mb-4 flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Product Scanner
              </Typography>
              
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef}
                  className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/70">
                    <QrCode className="h-24 w-24 opacity-50 mb-4" />
                    <Typography className="text-lg opacity-75">
                      {cameraState.error || 'Camera preview will appear when scanning'}
                    </Typography>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                {!scanning ? (
                  <>
                    <Button onClick={startScanning} color="blue" className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Start Scanning
                    </Button>
                    <Button variant="outlined" onClick={() => handleScanResult({ data: JSON.stringify(sampleProductData) })}>
                      Simulate Scan
                    </Button>
                  </>
                ) : (
                  <Button onClick={stopScanning} color="red" className="flex items-center gap-2">
                    <CameraOff className="h-5 w-5" />
                    Stop Scanning
                  </Button>
                )}
              </div>
            </div>

            {/* Live Tracking Map and Coordinates Display */}
            <div className="mb-8 flex">
              <div className="h-96 w-full rounded-lg overflow-hidden">
                <MapContainer 
                  key={`${geoPosition.latitude}-${geoPosition.longitude}`}
                  center={[geoPosition.latitude, geoPosition.longitude]}
                  zoom={9}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[geoPosition.latitude, geoPosition.longitude]}>
                    <Popup className="font-sans">
                      <div className="space-y-2">
                        <div className="font-bold text-blue-600">Delivery Vehicle</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Temperature:</span>
                          <span className="text-green-600">{sensorData.temperature}</span>
                          <span>Humidity:</span>
                          <span className="text-blue-600">{sensorData.humidity}</span>
                        </div>
                        <div className="pt-2 text-sm text-gray-500">
                          Updated: {new Date(timestamp).toLocaleTimeString('en-MA')}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Latitude and Longitude Display Next To Map */}
              <div className="flex flex-col justify-center pl-4">
                <Typography variant="h6">Coordinates:</Typography>
                <Typography>
                  Latitude: <span className="font-mono">{geoPosition.latitude.toFixed(6)}</span>
                </Typography>
                <Typography>
                  Longitude: <span className="font-mono">{geoPosition.longitude.toFixed(6)}</span>
                </Typography>
              </div>
            </div>

            {/* Scanned Product Details */}
            {scannedProduct && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <Typography variant="h4">Product Details</Typography>
                  <Button variant="outlined" onClick={() => setScannedProduct(null)}>
                    Scan Another
                  </Button>
                </div>
                {/* ... (Keep your existing product details UI) */}
              </div>
            )}
          </Card>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <Typography variant="h5" className="mb-4">Monthly Deliveries</Typography>
                <BarChart width={500} height={300} data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#4f46e5" />
                </BarChart>
              </Card>

              <Card className="p-6">
                <Typography variant="h5" className="mb-4">Shipment Status</Typography>
                <PieChart width={500} height={300}>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={['#10b981', '#3b82f6', '#f59e0b'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Distributor;