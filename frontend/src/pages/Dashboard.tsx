import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiveMQService } from '../services/hivemqService';
import ControlPanel from '../components/ControlPanel';
import SettingsPanel from '../components/SettingsPanel';
import '../App.css';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, userData, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(1);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [selectedDevice] = useState('default');

  useEffect(() => {
    if (userData?.tenantId) {
      // HiveMQ Cloud'a bağlan
      HiveMQService.connect(userData.tenantId, selectedDevice)
        .then(() => {
          console.log('✅ HiveMQ bağlantısı başarılı');
        })
        .catch((err) => {
          console.error('❌ HiveMQ bağlantı hatası:', err);
        });

      HiveMQService.onConnect(() => setMqttConnected(true));
      HiveMQService.onDisconnect(() => setMqttConnected(false));

      return () => {
        HiveMQService.disconnect();
      };
    }
  }, [userData, selectedDevice]);

  const handleLogout = async () => {
    try {
      HiveMQService.disconnect();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-user-info">
          <h2 className="header-title">
            💡 LED Kontrol
          </h2>
        </div>
        <div className="header-actions">
          <span className={`connection-badge ${mqttConnected ? 'connected' : 'disconnected'}`}>
            {mqttConnected ? '🟢 Bağlı' : '🔴 Bağlantı Yok'}
          </span>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* Main Control Panel */}
      <ControlPanel
        currentBuilding={currentBuilding}
        onBuildingChange={setCurrentBuilding}
        mqttConnected={mqttConnected}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentBuilding={currentBuilding}
        onBuildingChange={setCurrentBuilding}
      />

      {/* Settings Toggle Button */}
      <button
        className="settings-toggle"
        onClick={() => setSettingsOpen(!settingsOpen)}
        aria-label="Ayarlar"
      >
        <span className="hamburger-icon">☰</span>
      </button>
    </>
  );
}
