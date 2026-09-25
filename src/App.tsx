import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "./store/useAppStore";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Favorites from "./pages/Favorites";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import { initAdMob, showBanner } from "./services/adMobService";

export default function App() {
  useEffect(() => {
    initAdMob().then(() => {
      showBanner();
    });
  }, []);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

