// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Manifactured from './components/Manifactured';
import DistributorQRScanner from './components/DistributorQRScanner'; // Updated import
import PharmacyQRScanner from './components/PharmacyQRScanner'; // New import
import QrCodeGenerator from './components/QrCodeGenerator'; // Ensure you have this component
import Pharmacy from './components/Pharmacy';


function App() {
    const [medicamentId, setMedicamentId] = useState(''); // Store selected medicament ID

    return (
        <Router>
            <div>
                <Routes>
                <Route path="/Pharmacy" element={<Pharmacy />} />

                    <Route path="/" element={<Login />} />
                    <Route path="/manifactured" element={<Manifactured />} />
                    {/*  Add a route for Distributor Scanner */}
                    <Route path="/scan/distributor" element={<DistributorQRScanner setMedicamentId={setMedicamentId} />} />
                    {/*  Add a route for Pharmacy Scanner */}
                    <Route path="/scan/pharmacy" element={<PharmacyQRScanner setMedicamentId={setMedicamentId} />} />
                </Routes>

                {medicamentId && <QrCodeGenerator medicamentId={medicamentId} />} {/* Show QR Code when ID is set */}
            </div>
        </Router>
    );
}

export default App;