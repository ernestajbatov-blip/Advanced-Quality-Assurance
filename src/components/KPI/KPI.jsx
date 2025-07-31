import React, { useState, useEffect, useContext } from "react";
import styles from "./KPI.module.css";
import DataDisplay from "../DataDisplay/DataDisplay";
import { fetchKPIProduction, fetchKPIInjection } from "../../axios/wellService";
import { WellsContext } from "../../states/WellsContext";

export default function KPI({ chartType = "liquid" }) {
  const { fond } = useContext(WellsContext);
  const [kpiData, setKpiData] = useState({
    // Production wells data (nagn = 0)
    zamernaya_fluid: "0.00",
    zamernaya_oil: "0.00", 
    park_fluid: "0.00",
    park_oil: "0.00",
    tech_rezh_fluid: "0.00",
    tech_rezh_oil: "0.00",
    park_coefficient: "0.00",
    
    // Injection wells data (nagn = 1)
    sum_zakachka: "0.00",
    park_dobycha: "0.00", 
    tech_rezh_vrp: "0.00"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch KPI data based on fond selection
  const fetchKPIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (fond === 1) {
        // Injection wells (nagn = 1)
        response = await fetchKPIInjection();
      } else {
        // Production wells (nagn = 0) - default
        response = await fetchKPIProduction();
      }
      
      if (response.data) {
        setKpiData(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (err) {
      console.error("Error fetching KPI data:", err);
      setError("Ошибка загрузки данных KPI");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or fond changes
  useEffect(() => {
    fetchKPIData();
  }, [fond]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchKPIData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fond]);

  // Render production wells KPI (nagn = 0)
  const renderProductionKPI = () => {
    const isOil = chartType === "oil";
    
    return (
      <>
        {/* Row 1: Zamernaya and Parkovaya production */}
        <DataDisplay 
          label="Замерная добыча" 
          value={isOil ? kpiData.zamernaya_oil : kpiData.zamernaya_fluid}
          unit={isOil ? "т/сут" : "м³/сут"}
        />
        <DataDisplay 
          label="Парковая добыча" 
          value={isOil ? kpiData.park_oil : kpiData.park_fluid}
          unit={isOil ? "т/сут" : "м³/сут"}
        />
        
        {/* Row 2: Tech regime */}
        <DataDisplay 
          label="Тех. режим по жидкости" 
          value={kpiData.tech_rezh_fluid}
          unit="м³/сут"
        />
        <DataDisplay 
          label="Тех. режим по нефти" 
          value={kpiData.tech_rezh_oil}
          unit="т/сут"
        />
        
        {/* Row 3: Parkovy coefficient */}
        <DataDisplay 
          label="Парковый коэффициент" 
          value={kpiData.park_coefficient}
          unit=""
        />
      </>
    );
  };

  // Render injection wells KPI (nagn = 1)
  const renderInjectionKPI = () => {
    return (
      <>
        {/* Row 1: Zakachka and Park dobycha */}
        <DataDisplay 
          label="Сумма закачки" 
          value={kpiData.sum_zakachka}
          unit="м³/сут"
        />
        <DataDisplay 
          label="Парковая добыча" 
          value={kpiData.park_dobycha}
          unit="м³/сут"
        />
        
        {/* Row 2: Tech regime VRP */}
        <DataDisplay 
          label="Тех. режим по ВРП" 
          value={kpiData.tech_rezh_vrp}
          unit="м³/сут"
        />
      </>
    );
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <span>Загрузка...</span>
        </div>
      )}
      
      {fond === 1 ? renderInjectionKPI() : renderProductionKPI()}
    </div>
  );
}