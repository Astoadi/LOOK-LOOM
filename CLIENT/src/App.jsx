import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ScrollProgressBar } from './components/motion/index.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Landing_Page from './pages/landing_page.jsx';
import Home_page from './pages/home_page.jsx';
import Auth_Page from './pages/auth.jsx';
import Outfits from './pages/outfits';
import Future_plans from './pages/future_plans';
import SOutfit from './pages/[outfit_id]';
import Dresses from './pages/dresses';
import SDress from './pages/[outfit_category_id]';
import MyProfile from './pages/myProfile';
import Connections from './pages/connections';
import ProfileId from './pages/[profile_id]';

function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <ScrollProgressBar />
        <Router>
          <Routes>
            <Route path="/" element={<Landing_Page />} />
            <Route path="/home" element={<Home_page />} />
            <Route path="/auth" element={<Auth_Page />} />
            <Route path="/outfits" element={<Outfits />} />
            <Route path="/outfits/:outfit_id" element={<SOutfit />} />
            <Route path="/dresses" element={<Dresses />} />
            <Route path="/future_plans" element={<Future_plans />} />
            <Route path="/dresses/:outfit_category_id" element={<SDress />} />
            <Route path="/myProfile" element={<MyProfile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/user/:pId" element={<ProfileId />} />
          </Routes>
        </Router>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
