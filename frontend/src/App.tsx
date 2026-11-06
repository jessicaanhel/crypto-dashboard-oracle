import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import Overview from './pages/Overview';
import SmartMoney from './pages/SmartMoney';
import CryptoMarkets from './pages/CryptoMarkets';
import FiatRates from './pages/FiatRates';
import PersonalPnl from './pages/PersonalPnl';
import Watchlist from './pages/Watchlist';
import Oracle from './pages/Oracle';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/smart-money" element={<SmartMoney />} />
        <Route path="/crypto" element={<CryptoMarkets />} />
        <Route path="/fiat" element={<FiatRates />} />
        <Route path="/personal-pnl" element={<PersonalPnl />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
