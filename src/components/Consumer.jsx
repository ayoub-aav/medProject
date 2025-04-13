import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Typography, Input, Dialog, DialogHeader, DialogBody, DialogFooter } from '@material-tailwind/react';
import { QrCode, History, Pill, Lock, Camera, CameraOff, CheckCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';

function Consumer() {
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedData, setScannedData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInfo, setAuthInfo] = useState({
    email: '',
    password: ''
  });
  const [scanning, setScanning] = useState(false);
  const [cameraState, setCameraState] = useState({
    isActive: false,
    error: null,
    availableCameras: []
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Mock data
  const productHistory = [
    {
      id: 'MFG-2023-001',
      date: '2023-05-15',
      action: 'Manufactured',
      location: 'Paris, France'
    },
    {
      id: 'TRK-2023-001',
      date: '2023-05-20',
      action: 'Shipped',
      location: 'Lyon, France'
    },
    {
      id: 'PH-2023-001',
      date: '2023-05-25',
      action: 'Delivered',
      location: 'Local Pharmacy'
    }
  ];

  const productInfo = {
    name: 'Paracetamol 500mg',
    batch: 'BATCH-12345',
    manufacturer: 'PharmaCorp',
    expiry: '2024-05-15',
    composition: 'Paracetamol (500mg), Excipients',
    usage: 'Pain and fever relief',
    warnings: 'Do not exceed recommended dosage'
  };

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
    
    setScannedData({
      productId: 'MED-123456',
      batch: 'BATCH-12345'
    });
    
    setMessage({ 
      text: `Scanned: ${productInfo.name} (BATCH-12345)`, 
      type: 'success' 
    });

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    setActiveTab('info');
  };

  // Simulate scan for demo
  const simulateScan = () => {
    handleScanResult({ data: JSON.stringify(productInfo) });
  };

  // Clean up
  useEffect(() => {
    checkCameraAvailability();
    return () => stopScanning();
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthModalOpen(false);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
      <div className="w-full max-w-7xl">
        {/* Header with logo and title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <Pill className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PharmaTrack</h1>
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
            className={`py-2 px-4 font-medium ${activeTab === 'scan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('scan')}
          >
            <div className="flex items-center">
              <QrCode className="mr-2 h-5 w-5" />
              <span>Scan Product</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => scannedData ? setActiveTab('info') : null}
            disabled={!scannedData}
          >
            <div className="flex items-center">
              <Pill className="mr-2 h-5 w-5" />
              <span>Product Info</span>
            </div>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => {
              if (!scannedData) return;
              setAuthModalOpen(true);
            }}
            disabled={!scannedData}
          >
            <div className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              <span>Product History</span>
            </div>
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

        {activeTab === 'scan' ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
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
            </div>
          </div>
        ) : activeTab === 'info' && scannedData ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <Typography variant="h3" className="mb-6 flex items-center">
              <Pill className="mr-2 h-6 w-6 text-blue-600" />
              <span>Medicine Information</span>
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <Typography variant="h5" color="blue-gray">
                  {productInfo.name}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Batch: {scannedData.batch}
                </Typography>
              </Card>

              <div className="space-y-6">
                <div>
                  <Typography variant="h6" color="blue-gray">
                    Manufacturer
                  </Typography>
                  <Typography>{productInfo.manufacturer}</Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray">
                    Expiry Date
                  </Typography>
                  <Typography>{productInfo.expiry}</Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray">
                    Composition
                  </Typography>
                  <Typography>{productInfo.composition}</Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray">
                    Usage
                  </Typography>
                  <Typography>{productInfo.usage}</Typography>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray">
                    Warnings
                  </Typography>
                  <Typography className="text-red-500">{productInfo.warnings}</Typography>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'history' && scannedData ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <Typography variant="h3" className="mb-6 flex items-center">
              <History className="mr-2 h-6 w-6 text-blue-600" />
              <span>Product History</span>
            </Typography>
            
            <Typography variant="small" className="text-gray-600 mb-4">
              Batch: {scannedData.batch}
            </Typography>

            <div className="space-y-4">
              {productHistory.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between">
                    <Typography variant="h6">{item.action}</Typography>
                    <Typography variant="small" className="text-gray-600">
                      {item.date}
                    </Typography>
                  </div>
                  <Typography>{item.location}</Typography>
                  <Typography variant="small" className="text-gray-600">
                    ID: {item.id}
                  </Typography>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Authentication Modal */}
      <Dialog open={authModalOpen} handler={() => setAuthModalOpen(false)}>
        <DialogHeader className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Authentication Required
        </DialogHeader>
        <form onSubmit={handleAuthSubmit}>
          <DialogBody>
            <Typography className="mb-4">
              Please login to access full product history.
            </Typography>
            
            <div className="mb-4">
              <Input
                label="Email"
                type="email"
                required
                value={authInfo.email}
                onChange={(e) => setAuthInfo({...authInfo, email: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <Input
                label="Password"
                type="password"
                required
                value={authInfo.password}
                onChange={(e) => setAuthInfo({...authInfo, password: e.target.value})}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              onClick={() => setAuthModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Login
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default Consumer;