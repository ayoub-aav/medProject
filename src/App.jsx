import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Addusers from './components/Addusers';
import Manufacturer from './components/Manufacturer';
import Distributor from './components/Distributor';
import Pharmacy from './components/pharmacy';
import MedicationHistory from './components/MedicationHistory';

MedicationHistory



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Addusers />} />
        <Route path="/manufacturer" element={<Manufacturer />} />
        <Route path="/distributor" element={<Distributor />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/medicationHistory" element={<MedicationHistory />} />


      </Routes>
    </Router>
  );
}

export default App;
