import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Addusers from './components/Addusers';
import Manufacturer from './components/Manufacturer';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Addusers />} />
        <Route path="/manufacturer" element={<Manufacturer />} />
      </Routes>
    </Router>
  );
}

export default App;
