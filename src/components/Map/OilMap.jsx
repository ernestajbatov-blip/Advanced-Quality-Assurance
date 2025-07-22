import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchBSKWells } from "../../axios/wellService";
import styles from "./OilMap.module.css";

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
  active: createColoredIcon('#22c55e'),
  inactive: createColoredIcon('#ef4444'),
  maintenance: createColoredIcon('#f97316'),
  default: createColoredIcon('#6b7280')
};

// Component to handle map clicks for closing popups
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick
  });
  return null;
}

// Enhanced popup component with pie chart
const EnhancedPopup = ({ well }) => {
  const getStatusClass = (type) => {
    switch (type) {
      case "Active":
        return styles.statusActive;
      case "Inactive":
        return styles.statusInactive;
      case "Maintenance":
        return styles.statusMaintenance;
      default:
        return styles.statusInactive;
    }
  };

  const getStatusText = (type) => {
    switch (type) {
      case "Active":
        return "В сети";
      case "Inactive":
        return "Не в сети";
      case "Maintenance":
        return "Нет данных";
      default:
        return "Неизвестно";
    }
  };

  // Oil loss data for the pie chart
  const oilLossData = [
    { name: "Время работы", value: Math.abs(-9.8) },
    { name: "Обводненность", value: Math.abs(-13.4) },
    { name: "Дебит жидкости", value: 3.0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className={styles.enhancedPopup}>
      <div className={styles.popupHeader}>
        <h3 className={styles.popupTitle}>{well.name || 'Unknown Well'}</h3>
        <div className={`${styles.popupStatus} ${getStatusClass(well.type)}`}>
          {getStatusText(well.type)}
        </div>
      </div>
      
      <div className={styles.popupBody}>
        <div className={styles.popupSection}>
          <div className={styles.sectionTitle}>Анализ потерь нефти</div>
          <div className={styles.chartContainer}>
            <PieChart width={280} height={160}>
              <RechartsTooltip />
              <Pie
                data={oilLossData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {oilLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className={styles.chartLegend}>
              {oilLossData.map((entry, index) => (
                <div key={`legend-${index}`} className={styles.legendItem}>
                  <div 
                    className={styles.legendColor} 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className={styles.legendText}>
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.popupSection}>
          <div className={styles.sectionTitle}>Координаты</div>
          <div className={styles.coordinates}>
            {well.coords ? `${well.coords[0].toFixed(6)}°N, ${well.coords[1].toFixed(6)}°E` : 'Не указаны'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OilMap() {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
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
            if (!well || !well['Скважина']) return false;
            
            const lat = parseFloat(well['Широта']);
            const lng = parseFloat(well['Долгота']);
            
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((well, index) => {
            let wellType = "Inactive";
            const isWorking = well['Работа'];
            
            if (isWorking === 1 || isWorking === "1") {
              wellType = "Active";
            } else if (isWorking === 2 || isWorking === "2") {
              wellType = "Maintenance";
            } else if (isWorking === 3 || isWorking === "3") {
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
              working: well['Работа'] || 0
            };
          });

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
    setSelectedSuggestionIndex(-1);
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

  const handleMapClick = (e) => {
    // Handle map click if needed
  };

  const handleClearFilters = () => {
    setFilter("All");
    setSearchTerm("");
    setShowSearchResults(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchResultClick = (well) => {
    setSearchTerm(well.name);
    
    if (mapRef.current && well.coords) {
      mapRef.current.setView(well.coords, 15);
      
      setTimeout(() => {
        const marker = markerRefs.current[well.id];
        if (marker) {
          marker.openPopup();
        }
      }, 300);
    }
    
    setShowSearchResults(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchTerm.trim() !== "" && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Загрузка карты скважин...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>Ошибка: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.oilMapContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Карта скважин</h2>
        {/* <div className={styles.headerStats}>
          <span className={styles.statActive}>В сети: {counts.Active}</span>
          <span className={styles.statMaintenance}>Нет данных: {counts.Maintenance}</span>
          <span className={styles.statInactive}>Не в сети: {counts.Inactive}</span>
          <span className={styles.statTotal}>Всего: {wells.length}</span>
        </div> */}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        {/* <div className={styles.sidebar} ref={searchContainerRef}>
          <div className={styles.sidebarHeader}>
            {/* <h3>Фильтры скважин</h3> */}
          {/* </div> */}
        <div className={styles.controlsRow}>
          <div className={styles.topRow}>
            {/* Search Container */}
            
          
            {/* Search Input */}
            <div className={styles.searchContainer}>
              <label className={styles.searchLabel}>
                Поиск скважины:
              </label>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleSearchKeyDown}
                placeholder="Введите название скважины"
                className={styles.searchInput}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className={styles.searchDropdown}>
                  {searchResults.map((well, index) => (
                    <div
                      key={well.id}
                      onClick={() => handleSearchResultClick(well)}
                      className={`${styles.searchResultItem} ${
                        selectedSuggestionIndex === index ? styles.searchResultItemSelected : ''
                      }`}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                    >
                      <div className={styles.searchResultName}>
                        {well.name}
                      </div>
                      <div className={styles.searchResultStatus}>
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
                <div className={styles.noResultsMessage}>
                  Скважины не найдены
                </div>
              )}
            </div>
            
            {/* Filter Select */}
            <div className={styles.filterContainer}>
              <label className={styles.filterLabel}>Статус контроллера:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">Все</option>
                <option value="Active">В сети</option>
                <option value="Inactive">Не в сети</option>
                <option value="Maintenance">Нет данных</option>
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className={styles.buttonContainer}>
            <button
              onClick={handleClearFilters}
              className={styles.clearFiltersButton}
            >
              Очистить фильтры
            </button>
          </div>

        </div>

        {/* Map Container */}
        <div className={styles.mapContainer}>
          {wells.length > 0 ? (
            <MapContainer
              center={wells.length > 0 ? wells[0].coords : [45, 55.23]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer 
                url="/tiles/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={18}
                minZoom={6}
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {filteredWells.map((well) => {
                if (!well || !well.coords || !Array.isArray(well.coords) || well.coords.length !== 2) {
                  return null;
                }
                
                const [lat, lng] = well.coords;
                if (isNaN(lat) || isNaN(lng)) {
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
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <div className={styles.tooltipContent}>
                        {well.name || 'Unknown Well'}
                      </div>
                    </Tooltip>
                    <Popup
                      className={styles.customPopup}
                      closeButton={true}
                      autoClose={true}
                      closeOnClick={true}
                      closeOnEscapeKey={true}
                      keepInView={true}
                      maxWidth={320}
                      minWidth={280}
                    >
                      <EnhancedPopup well={well} />
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className={styles.noDataContainer}>
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>
    </div>
  );
}