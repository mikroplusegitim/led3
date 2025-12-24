import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { MQTTService, StatusData } from '../services/mqttService'
import './SettingsPanel.css'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  currentBuilding: number
  onBuildingChange: (building: number) => void
}

interface BuildingData {
  id: number
  name: string
  totalApartments: number
  available: number
  sold: number
  reserved: number
  salesRate: number
}

export default function SettingsPanel({
  isOpen,
  onClose,
  currentBuilding,
  onBuildingChange
}: SettingsPanelProps) {
  const { currentUser, userData } = useAuth()
  const [buildings, setBuildings] = useState<BuildingData[]>([
    { id: 1, name: 'A Blok', totalApartments: 50, available: 50, sold: 0, reserved: 0, salesRate: 0 },
    { id: 2, name: 'B Blok', totalApartments: 50, available: 50, sold: 0, reserved: 0, salesRate: 0 },
    { id: 3, name: 'C Blok', totalApartments: 50, available: 50, sold: 0, reserved: 0, salesRate: 0 },
    { id: 4, name: 'D 500', totalApartments: 150, available: 150, sold: 0, reserved: 0, salesRate: 0 },
  ])
  const [esp32Connected, setEsp32Connected] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // MQTT durum mesajlarını dinle
  useEffect(() => {
    const handleStatusUpdate = (data: StatusData) => {
      if (data.apartments && Array.isArray(data.apartments)) {
        updateBuildingStats(data.building || 1, data.apartments)
        setEsp32Connected(true)
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000)
      }
    }

    MQTTService.onStatus(handleStatusUpdate)

    return () => {
      MQTTService.onStatus(undefined)
    }
  }, [])

  const updateBuildingStats = (buildingId: number, apartments: number[]) => {
    setBuildings(prev => prev.map(building => {
      if (building.id === buildingId) {
        let available = 0
        let sold = 0
        let reserved = 0

        apartments.forEach(status => {
          if (status === 1) available++
          else if (status === 0) sold++
          else if (status === 2) reserved++
        })

        const salesRate = building.totalApartments > 0 
          ? (sold / building.totalApartments) * 100 
          : 0

        return {
          ...building,
          available,
          sold,
          reserved,
          salesRate: parseFloat(salesRate.toFixed(1))
        }
      }
      return building
    }))
  }

  const handleBuildingChange = (building: number) => {
    if (building >= 1 && building <= 10) {
      onBuildingChange(building)
      MQTTService.changeBuilding(building)
    }
  }

  const handleAddBuilding = () => {
    const newId = buildings.length + 1
    const newBuilding: BuildingData = {
      id: newId,
      name: `${String.fromCharCode(64 + newId)} Blok`,
      totalApartments: 50,
      available: 50,
      sold: 0,
      reserved: 0,
      salesRate: 0
    }
    setBuildings([...buildings, newBuilding])
  }

  const totalBuildings = buildings.length
  const totalApartments = buildings.reduce((sum, b) => sum + b.totalApartments, 0)
  const totalAvailable = buildings.reduce((sum, b) => sum + b.available, 0)
  const overallSalesRate = totalApartments > 0 
    ? (buildings.reduce((sum, b) => sum + b.sold, 0) / totalApartments) * 100 
    : 0

  return (
    <>
      <div 
        className={`settings-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <div>
            <div className="user-profile">
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <div className="user-name">{userData?.displayName || 'Kullanıcı'}</div>
                <div className="user-email">{currentUser?.email}</div>
              </div>
            </div>
            <div className="header-divider"></div>
            <h2>Maket Aydınlatma Kontrol</h2>
            <p className="subtitle">Bina ve daire yönetim sistemi</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="dashboard-content">
          {/* Özet Kartları */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <div className="card-label">Toplam Bina</div>
                <div className="card-value">{totalBuildings}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">🏠</div>
              <div className="card-content">
                <div className="card-label">Toplam Daire</div>
                <div className="card-value">{totalApartments}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-label">Müsait</div>
                <div className="card-value green">{totalAvailable}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-content">
                <div className="card-label">Satış Oranı</div>
                <div className="card-value">{overallSalesRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Bina Kartları */}
          <div className="buildings-section">
            <div className="section-header">
              <h3>Binalar</h3>
              <button className="add-building-btn" onClick={handleAddBuilding}>
                <span>+</span> Yeni Bina Ekle
              </button>
            </div>
            
            <div className="buildings-grid">
              {buildings.map((building) => (
                <div 
                  key={building.id} 
                  className={`building-card ${currentBuilding === building.id ? 'active' : ''}`}
                  onClick={() => handleBuildingChange(building.id)}
                >
                  <div className="building-header">
                    <span className="building-icon">🏢</span>
                    <span className="building-name">{building.name}</span>
                  </div>
                  
                  <div className="building-stats">
                    <div className="stat-row">
                      <span className="stat-label">Toplam Daire:</span>
                      <span className="stat-value">{building.totalApartments}</span>
                    </div>
                    
                    <div className="stat-row">
                      <span className="stat-label">Satış Oranı:</span>
                      <span className="stat-value">{building.salesRate}%</span>
                    </div>
                    
                    <div className="status-indicators">
                      <div className="status-item">
                        <span className="status-dot green"></span>
                        <span className="status-label">Müsait:</span>
                        <span className="status-value">{building.available}</span>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-dot red"></span>
                        <span className="status-label">Satıldı:</span>
                        <span className="status-value">{building.sold}</span>
                      </div>
                      
                      <div className="status-item">
                        <span className="status-dot blue"></span>
                        <span className="status-label">Rezerve:</span>
                        <span className="status-value">{building.reserved}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bildirim */}
        {showNotification && (
          <div className="notification">
            <span className="notification-icon">⚠</span>
            <span className="notification-text">
              Daireler güncellendi {esp32Connected ? '' : '(ESP32 bağlantısı yok)'}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
