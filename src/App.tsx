import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Landing from './components/Landing';
import ChngPass from './components/ChngPass'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/ChngPass" element={<ChngPass />} />
      </Routes>
    </Router>
  );
};

export default App;