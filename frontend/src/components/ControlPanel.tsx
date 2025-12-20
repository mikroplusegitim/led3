import { useState } from 'react'
import { MQTTService } from '../services/mqttService'
import './ControlPanel.css'

interface ControlPanelProps {
  currentBuilding: number
  onBuildingChange: (building: number) => void
  mqttConnected: boolean
}

export default function ControlPanel({ currentBuilding, onBuildingChange, mqttConnected }: ControlPanelProps) {
  const [apartmentNumber, setApartmentNumber] = useState('')
  const [showSold, setShowSold] = useState(true)
  const [peyzajActive, setPeyzajActive] = useState(false)
  const [sokakActive, setSokakActive] = useState(false)
  const [activeScenario, setActiveScenario] = useState<0 | 1 | 2>(0)

  const setAptStatus = (status: 0 | 1 | 2 | 3) => {
    if (!apartmentNumber) {
      alert('Daire no girin!')
      return
    }
    const aptNum = parseInt(apartmentNumber)
    if (aptNum < 1 || aptNum > 150) {
      alert('Daire numarası 1-150 arasında olmalıdır!')
      return
    }
    MQTTService.setApartmentStatus(currentBuilding, aptNum, status)
    setActiveScenario(0)
  }

  const togglePeyzaj = () => {
    const newState = !peyzajActive
    setPeyzajActive(newState)
    MQTTService.setEnvironment('peyzaj', newState)
    setActiveScenario(0)
  }

  const toggleSokak = () => {
    const newState = !sokakActive
    setSokakActive(newState)
    MQTTService.setEnvironment('sokak', newState)
    setActiveScenario(0)
  }

  const toggleSold = () => {
    const newState = !showSold
    setShowSold(newState)
    MQTTService.setShowSold(newState)
  }

  const setScenario = (id: 1 | 2) => {
    if (activeScenario === id) {
      setActiveScenario(0)
      MQTTService.setScenario(0)
    } else {
      setActiveScenario(id)
      MQTTService.setScenario(id)
    }
  }

  const resetAll = () => {
    MQTTService.resetAll()
    setPeyzajActive(false)
    setSokakActive(false)
    setActiveScenario(0)
  }

  return (
    <div className="container">
      <div className="connection-status" data-connected={mqttConnected}>
        {mqttConnected ? '● Bağlı' : '○ Bağlantı Yok'}
      </div>
      
      <div className="section">
        <div className="title">Daire Kontrol</div>
        <div className="building-selector">
          <span>Bina: {currentBuilding}</span>
        </div>
        <input
          type="number"
          id="apt"
          placeholder="No."
          value={apartmentNumber}
          onChange={(e) => setApartmentNumber(e.target.value)}
          min="1"
          max="150"
        />
        <div className="row">
          <button className="btn-green" onClick={() => setAptStatus(1)}>
            Musait
          </button>
          <button onClick={() => setAptStatus(0)}>
            Satildi
          </button>
        </div>
        <div className="row">
          <button className="btn-blue" onClick={() => setAptStatus(2)}>
            Rez.
          </button>
          <button onClick={() => setAptStatus(3)}>
            Kapat
          </button>
        </div>
      </div>

      <div className="section">
        <div className="title">Cevre & Filtre</div>
        <button
          id="peyzaj"
          className={`btn-gold ${peyzajActive ? 'active' : ''}`}
          onClick={togglePeyzaj}
        >
          Peyzaj Aydinlatma
        </button>
        <button
          id="sokak"
          className={`btn-gold ${sokakActive ? 'active' : ''}`}
          onClick={toggleSokak}
        >
          Sokak Lambalari
        </button>
        <button
          id="sold"
          className={`btn-red ${showSold ? 'active' : ''}`}
          onClick={toggleSold}
        >
          Satilanlari Goster/Gizle
        </button>
      </div>

      <div className="section">
        <div className="title">Senaryolar</div>
        <button
          id="anim1"
          className={`btn-gold btn-anim ${activeScenario === 1 ? 'active' : ''}`}
          onClick={() => setScenario(1)}
        >
          Karsilama Modu
        </button>
        <button
          id="anim2"
          className={`btn-gold btn-anim ${activeScenario === 2 ? 'active' : ''}`}
          onClick={() => setScenario(2)}
        >
          Gece Ambiyansi
        </button>
        <button
          onClick={resetAll}
          style={{ marginTop: '5px', borderColor: '#e74c3c', color: '#e74c3c' }}
        >
          Tumunu Kapat
        </button>
      </div>
    </div>
  )
}

