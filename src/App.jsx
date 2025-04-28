// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Manifactured from './components/Manifactured';
import DistributorQRScanner from './components/DistributorQRScanner'; // Updated import
import PharmacyQRScanner from './components/PharmacyQRScanner'; // New import
import QrCodeGenerator from './components/QrCodeGenerator'; // Ensure you have this component
import Pharmacy from './components/Pharmacy';
import Addusers from './components/Addusers'
import Consumer from './components/Consumer';
import Manufacturer from './components/Manufacturer';
import Distributor from './components/Distributor';


function App() {
    const [medicamentId, setMedicamentId] = useState(''); // Store selected medicament ID

    return (
        <Router>
            <div>
                <Routes>

                    <Route path="/" element={<Login />} />
                    <Route path="/manifactured" element={<Manifactured />} />

                    {/*  Add a route for Distributor Scanner */}
                    <Route path="/scan/distributor" element={<DistributorQRScanner setMedicamentId={setMedicamentId} />} />
                    {/*  Add a route for Pharmacy Scanner */}
                    <Route path="/scan/pharmacy" element={<PharmacyQRScanner setMedicamentId={setMedicamentId} />} />
                    <Route path="/admin" element={<Addusers />} />

                    <Route path="/Manufacturer" element={<Manufacturer />} />
        <Route path="/Distributor" element={<Distributor />} />
        <Route path="/Pharmacy" element={<Pharmacy />} />
        <Route path="/Consumer" element={<Consumer />} />


                </Routes>

                {medicamentId && <QrCodeGenerator medicamentId={medicamentId} />} {/* Show QR Code when ID is set */}
            </div>
        </Router>
    );
}

export default App;