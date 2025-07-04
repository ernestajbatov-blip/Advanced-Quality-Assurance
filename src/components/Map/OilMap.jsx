import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchBSKWells, fetchWellData } from "../../axios/wellService";

const createColoredIcon = (color) => {
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `;
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  active: createColoredIcon('#22c55e'),     // green
  inactive: createColoredIcon('#ef4444'),   // red  
  maintenance: createColoredIcon('#f97316'), // orange
  default: createColoredIcon('#6b7280')     // gray
};

// Component to handle map clicks for closing popups
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick
  });
  return null;
}

export default function OilMap() {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [openPopupId, setOpenPopupId] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Fetch all wells data
  useEffect(() => {
    const fetchWellsData = async () => {
      try {
        setLoading(true);
        
        const response = await fetchBSKWells();
        const wellsData = response.data || [];
        
        console.log("Raw wells data:", wellsData);
        
        // Transform the wells data with proper null/undefined checks
        const transformedWells = wellsData
          .filter(well => {
            // Filter out invalid wells
            if (!well || !well['Скважина']) return false;
            
            const lat = parseFloat(well['Широта']);
            const lng = parseFloat(well['Долгота']);
            
            // Check for valid coordinates
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((well, index) => {
            // Determine well status based on 'Работа' field
            // 1 = Active, 2 = No Data (Maintenance), 3 = Inactive
            let wellType = "Inactive";
            const isWorking = well['Работа'];
            
            console.log(`Well ${well['Скважина']}: Работа value =`, isWorking, typeof isWorking);
            
            if (isWorking === 1 || isWorking === "1") {
              wellType = "Active";
            } else if (isWorking === 2 || isWorking === "2") {
              wellType = "Maintenance";
            } else if (isWorking === 3 || isWorking === "3") {
              wellType = "Inactive";
            } else {
              wellType = "Inactive";
            }

            return {
              id: index,
              name: well['Скважина'] || `Well ${index}`,
              coords: [
                parseFloat(well['Широта']),
                parseFloat(well['Долгота'])
              ],
              type: wellType,
              voltage: well['Напряжение'] || 0,
              power: well['Мощность'] || 0,
              frequency: well['Частота'] || 0,
              current: well['Ток'] || 0,
              speed: well['Скорость двигателя'] || 0,
              working: well['Работа'] || 0
            };
          });

        console.log("Transformed wells:", transformedWells);
        setWells(transformedWells);
      } catch (err) {
        console.error("Error fetching wells data:", err);
        setError("Failed to load wells data");
      } finally {
        setLoading(false);
      }
    };

    fetchWellsData();
  }, []);

  const filteredWells = filter === "All" 
    ? wells 
    : wells.filter((well) => well && well.type === filter);

  const counts = {
    Active: wells.filter((w) => w && w.type === "Active").length,
    Inactive: wells.filter((w) => w && w.type === "Inactive").length,
    Maintenance: wells.filter((w) => w && w.type === "Maintenance").length,
  };

  const handleWellClick = async (well, e) => {
    
  };

  const handleMapClick = (e) => {
 
  };

  const getWellIcon = (well) => {
    if (!well || !well.type) {
      console.log("Well or well.type is undefined:", well);
      return icons.default;
    }
    
    switch (well.type) {
      case "Active":
        return icons.active;
      case "Inactive":
        return icons.inactive;
      case "Maintenance":
        return icons.maintenance;
      default:
        return icons.default;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "500px",
        fontSize: "18px"
      }}>
        Загрузка карты скважин...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "500px",
        fontSize: "18px",
        color: "red"
      }}>
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", marginBottom: "50px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", paddingLeft: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>Карта скважин</h2>
        <div style={{ display: "flex", gap: "20px", fontSize: "1rem" }}>
          <span style={{ color: "green" }}>В сети: {counts.Active}</span>
          <span style={{ color: "orange" }}>Нет данных: {counts.Maintenance}</span>
          <span style={{ color: "red" }}>Не в сети: {counts.Inactive}</span>
          <span style={{ color: "white" }}>Всего: {wells.length}</span>
        </div>
      </div>

      {/* Filters and Map layout */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Sidebar Filter UI */}
        <div
          style={{
            width: "250px",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            height: "500px",
            boxSizing: "border-box",
            backgroundColor: "dark grey",
          }}
        >
          <h3>Фильтры скважин</h3>
          <label>Статус контроллера:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              display: "block",
              marginTop: "0.5rem",
              padding: "0.5rem",
              width: "100%",
            }}
          >
            <option value="All">Все</option>
            <option value="Active">В сети</option>
            <option value="Inactive">Не в сети</option>
            <option value="Maintenance">Нет данных</option>
          </select>
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, height: "500px" }}>
          {wells.length > 0 ? (
            <MapContainer
              center={wells.length > 0 ? wells[0].coords : [48.447964, 57.18]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onMapClick={handleMapClick} />
              {filteredWells.map((well) => {
                if (!well || !well.coords || !Array.isArray(well.coords) || well.coords.length !== 2) {
                  console.log("Skipping invalid well:", well);
                  return null;
                }
                
                const [lat, lng] = well.coords;
                if (isNaN(lat) || isNaN(lng)) {
                  console.log("Skipping well with invalid coordinates:", well);
                  return null;
                }
                
                return (
                  <Marker 
                    key={well.id || `well-${Math.random()}`} 
                    position={well.coords} 
                    icon={getWellIcon(well)}
                    ref={(ref) => {
                      if (ref) {
                        markerRefs.current[well.id] = ref;
                      }
                    }}
                    eventHandlers={{
                      click: (e) => handleWellClick(well, e)
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {well.name || 'Unknown Well'}
                      </div>
                    </Tooltip>
                    <Popup
                      closeButton={true}
                      autoClose={true}
                      closeOnClick={true}
                      closeOnEscapeKey={true}
                      keepInView={true}
                    >
                      <div style={{ minWidth: "200px" }}>
                        <div style={{ marginBottom: "10px" }}>
                          <b>{well.name || 'Unknown Well'}</b>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Статус контроллера:</strong> {
                            well.type === "Active" ? "В сети" : 
                            well.type === "Inactive" ? "Не в сети" : 
                            "Нет данных"
                          }
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Напряжение:</strong> {well.voltage || 0} В
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Мощность:</strong> {well.power || 0} кВт
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Частота:</strong> {well.frequency || 0} Гц
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          <strong>Ток:</strong> {well.current || 0} А
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <strong>Скорость:</strong> {well.speed || 0} об/мин
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                          <strong>Координаты:</strong> {well.coords ? `${well.coords[0].toFixed(6)}°N, ${well.coords[1].toFixed(6)}°E` : 'Не указаны'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "100%",
              backgroundColor: "dark grey",
              borderRadius: "8px"
            }}>
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>
    </div>
  );
}