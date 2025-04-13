import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
//import Addusers from './components/Addusers';
import Manifactured from './components/Manifactured';
import QRScanner from './components/QRScanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/manifactured" element={<Manifactured />} />
        <Route path="/scan" element={<QRScanner />} />


      </Routes>
    </Router>
  );
}

export default App;
