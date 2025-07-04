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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [openPopupId, setOpenPopupId] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    const filtered = wells.filter(well => 
      well.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
    setSelectedSuggestionIndex(-1); // Reset selection when results change
  }, [searchTerm, wells]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  // Clear filters function
  const handleClearFilters = () => {
    setFilter("All");
    setSearchTerm("");
    setShowSearchResults(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle search result selection
  const handleSearchResultClick = (well) => {
    // Set the selected well name in the search bar
    setSearchTerm(well.name);
    
    if (mapRef.current && well.coords) {
      // Center map on selected well
      mapRef.current.setView(well.coords, 15);
      
      // Open popup for the selected well with a small delay to ensure map has settled
      setTimeout(() => {
        const marker = markerRefs.current[well.id];
        if (marker) {
          marker.openPopup();
        }
      }, 300); // 300ms delay to allow map animation to complete
    }
    
    // Hide search results and reset selection
    setShowSearchResults(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchTerm.trim() !== "" && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Handle search input click
  const handleSearchClick = () => {
    if (searchTerm.trim() !== "" && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Handle keyboard navigation and enter key press
  const handleSearchKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchResults.length) {
          handleSearchResultClick(searchResults[selectedSuggestionIndex]);
        } else if (searchResults.length > 0) {
          // If no suggestion is selected, select the first one
          handleSearchResultClick(searchResults[0]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
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
            position: "relative"
          }}
        >
          <h3>Фильтры скважин</h3>
          
          {/* Search Input */}
          <div style={{ marginBottom: "1rem" }} ref={searchContainerRef}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Поиск скважины:
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onClick={handleSearchClick}
              onKeyDown={handleSearchKeyDown}
              placeholder="Введите название скважины"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box"
              }}
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "150px",
                left: "1rem",
                right: "1rem",
                backgroundColor: "#4b5563",
                color: "white",
                border: "1px solid #374151",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {searchResults.map((well, index) => (
                  <div
                    key={well.id}
                    onClick={() => handleSearchResultClick(well)}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #6b7280",
                      fontSize: "0.875rem",
                      backgroundColor: selectedSuggestionIndex === index ? "#6b7280" : "transparent"
                    }}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                  >
                    <div style={{ fontWeight: "bold" }}>
                      {well.name}
                    </div>
                    <div style={{ color: "#d1d5db", fontSize: "0.75rem" }}>
                      Статус: {
                        well.type === "Active" ? "В сети" : 
                        well.type === "Inactive" ? "Не в сети" : 
                        "Нет данных"
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results Message */}
            {showSearchResults && searchResults.length === 0 && searchTerm.trim() !== "" && (
              <div style={{
                position: "absolute",
                top: "150px",
                left: "1rem",
                right: "1rem",
                backgroundColor: "#4b5563",
                color: "white",
                border: "1px solid #374151",
                borderRadius: "4px",
                padding: "0.5rem",
                fontSize: "0.875rem",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                Скважины не найдены
              </div>
            )}
          </div>
          
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
          
          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#4b5563";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#6b7280";
            }}
          >
            Очистить фильтры
          </button>
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
                          <strong>ID:</strong> {well.id}
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