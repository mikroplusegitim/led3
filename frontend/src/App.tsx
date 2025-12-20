import { useState, useEffect } from 'react'
import ControlPanel from './components/ControlPanel'
import SettingsPanel from './components/SettingsPanel'
import { MQTTService } from './services/mqttService'
import './App.css'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentBuilding, setCurrentBuilding] = useState(1)
  const [mqttConnected, setMqttConnected] = useState(false)

  useEffect(() => {
    // MQTT bağlantısını başlat
    MQTTService.connect()
    MQTTService.onConnect(() => setMqttConnected(true))
    MQTTService.onDisconnect(() => setMqttConnected(false))

    return () => {
      MQTTService.disconnect()
    }
  }, [])

  return (
    <>
      <ControlPanel 
        currentBuilding={currentBuilding}
        onBuildingChange={setCurrentBuilding}
        mqttConnected={mqttConnected}
      />
      <SettingsPanel 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentBuilding={currentBuilding}
        onBuildingChange={setCurrentBuilding}
      />
      <button
        className="settings-toggle"
        onClick={() => setSettingsOpen(!settingsOpen)}
        aria-label="Ayarlar"
      >
        <span className="hamburger-icon">☰</span>
      </button>
    </>
  )
}

export default App
