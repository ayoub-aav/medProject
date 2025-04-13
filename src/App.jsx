import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Addusers from './components/Addusers';
import Manufacturer from './components/Manufacturer';
import Distributor from './components/Distributor';
import Pharmacy from './components/Pharmacy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Addusers />} />
        <Route path="/Manufacturer" element={<Manufacturer />} />
        <Route path="/Distributor" element={<Distributor />} />
        <Route path="/Pharmacy" element={<Pharmacy />} />
      </Routes>
    </Router>
  );
}

export default App;
