import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiveMQService } from '../services/hivemqService';
import ControlPanel from '../components/ControlPanel';
import SettingsPanel from '../components/SettingsPanel';
import '../App.css';

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
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 20px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>💡 LED Kontrol</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
            {userData?.displayName || currentUser?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            {mqttConnected ? '🟢 Bağlı' : '🔴 Bağlantı Yok'}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
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
