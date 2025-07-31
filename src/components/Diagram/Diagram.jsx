import React from "react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import SchemeMain from "../../data/Diagrams/SchemeMain.svg";
import styles from "./Diagram.module.css";
import Indicator from "../Indicator/Indicator";
import LabelBox from "../LabelBox/LabelBox";
import ProgressBar from "../ProgressBar/ProgressBar";
import Pumps from "../Pumps/Pumps";
import Table from "../Table/Table";
import SimpleTable from "../SimpleTable/SimpleTable";
import AppNav from "../AppNav/AppNav";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import Modal from "../Modal/Modal";
import { NavLink } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format, parseISO, isSameDay } from "date-fns";
import Legend from "../Legends/Legends"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchVlagomerHistory, getAvailableVlagomerDates } from "../../axios/wellService";

const VlagomerTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        color: 'white'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{`Время: ${label}`}</p>
        <p style={{ margin: 0, color: '#2563eb' }}>
          {`Влажность: ${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Diagram() {
  const [oilProgressData, setOilProgressData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState("Sensor Data");
  const [showVlagomerChart, setShowVlagomerChart] = useState(false);
  const [vlagomerData, setVlagomerData] = useState([]);
  const [vlagomerLoading, setVlagomerLoading] = useState(false);
  const [selectedVlagomerDate, setSelectedVlagomerDate] = useState(null);
  const [availableVlagomerDates, setAvailableVlagomerDates] = useState([]);
  const [isVlagomerArchiveMode, setIsVlagomerArchiveMode] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/api/progress-oil")
    // axios.get("http://192.168.1.42:3000/api/progress-oil")
      .then(res => {
        setOilProgressData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch oil progress data", err);
      });
  }, []);

  useEffect(() => {
    loadAvailableVlagomerDates();
  }, []);

  const TAG_UNITS = {
    // tfs-1
    "ARM_TFS_LC1_L": "см",
    "ARM_LSA2_TFS": "см",
    "ARM_PT1_TFS": "атм",
    "ARM_TFS_LC1_H2O": "см",
    
    "ARM_TT1_TFS": "°C",

    // tfs-2
    "ARM_PT1_TFS2": "атм",
    "ARM_TT1_TFS2": "°C",
    "ARM_LC_I_TFS2": "см",
    "ARM_LC_L_TFS2": "см",
    "ARM_LSA2_TFS2": "cм",

    // ogn
    "ARM_OGN_LC2_H2O": "см",
    "ARM_OGN_LC2_L": "см",
    "ARM_PT2_OGN": "атм",
    "ARM_TT2_OGN": "°C",

    // edg
    "ARM_ADG_LC3_H2O": "cм",
    "ARM_ADG_LC3_L": "cм",
    "ARM_PT3_ADG": "атм",
    "ARM_TT3_ADG": "°C",

    // gs
    "ARM_LSA4_GS": "cм",
    "ARM_PDT1_GS": "кПа",
    "ARM_PT5_GS": "атм",
    "ARM_TT5_GS": "°C",

    // ksu
    "ARM_LSA3_KSU": "cм",
    "ARM_PT4_KSU": "атм",
    "ARM_TT4_KSU": "°C",
    
    // bpv
    "ARM_ZN_BPV_LS": "см",
    "ARM_ZN_BPV_LS_H2O": "см",
    "ARM_ZN_BPV_PT": "атм",
    "ARM_ZN_BPV_TT": "°C",

    // ep
    "ARM_ZN_EP1_LT": "cм",
    "ARM_ZN_EP2_LT": "cм",
    "ARM_ZN_EP3_LT": "cм",

    // Uzel ucheta units
    "overpressure": "МПа",
    "temperature": "°C",
    "volumetric_flow": "м³/ч",
    "volume": "м³",
    "consumption_brutto": "т/ч",
    "quantity_brutto": "т",
    "moisture_volume": "%",

    // Vlagomer
    "VlagomerTFS_1": "м3/ч"
  };

  // New mapping for tag descriptions
  const TAG_DESCRIPTIONS = {
    // tfs-1
    "ARM_TFS_LC1_L": "Общий Уровень",
    "ARM_LSA2_TFS": "Уровень Нефти",
    "ARM_TFS_LC1_H2O": "Уровень Воды",
    "ARM_PT1_TFS": "Давление",
    "ARM_TT1_TFS": "Температура",

    // tfs-2
    "ARM_LC_L_TFS2": "Общий Уровень",
    "ARM_LSA2_TFS2": "Уровень Нефти",
    "ARM_LC_I_TFS2": "Уровень Воды",
    "ARM_PT1_TFS2": "Давление",
    "ARM_TT1_TFS2": "Температура",
    
    // ogn
    "ARM_OGN_LC2_H2O": "Уровень",
    "ARM_OGN_LC2_L": "Уровень",
    "ARM_PT2_OGN": "Давление",
    "ARM_TT2_OGN": "Температура",

    // edg
    "ARM_ADG_LC3_H2O": "Уровень",
    "ARM_ADG_LC3_L": "Уровень",
    "ARM_PT3_ADG": "Давление",
    "ARM_TT3_ADG": "Температура",

    // gs
    "ARM_LSA4_GS": "Уровень",
    "ARM_PDT1_GS": "Давление",
    "ARM_PT5_GS": "Давление",
    "ARM_TT5_GS": "Температура",

    // ksu
    "ARM_LSA3_KSU": "Уровень",
    "ARM_PT4_KSU": "Давление",
    "ARM_TT4_KSU": "Температура",
    
    // bpv
    "ARM_ZN_BPV_LS": "Уровень",
    "ARM_ZN_BPV_LS_H2O": "Уровень",
    "ARM_ZN_BPV_PT": "Давление",
    "ARM_ZN_BPV_TT": "Температура",

    // ep
    "ARM_ZN_EP1_LT": "Уровень",
    "ARM_ZN_EP2_LT": "Уровень",
    "ARM_ZN_EP3_LT": "Уровень",

    // Uzel ucheta descriptions
    "overpressure": "Избыточное давление",
    "temperature": "Температура",
    "volumetric_flow": "Объемный расход (брутто)",
    "volume": "Объем (брутто)",
    "consumption_brutto": "Расход (брутто)",
    "quantity_brutto": "Количество (брутто)",
    "consumption_netto": "Расход (нетто)",
    "quantity_netto": "Количество (нетто)",
    "normal_operating_time": "Время штатной работы",
    "time_nonstandard_situations": "Время нештатных ситуаций",
    "density_petroleum_liquid": "Плотность нефтяной жидкости в р.у.",
    "density_oil_20": "Плотность нефти в ст.у. 20°С",
    "density_oil_15": "Плотность нефти в ст.у. 15°С",
    "moisture_volume": "Влагосодержание объемное",
    "moisture_weight": "Влагосодержание массовое",
    "viscosity": "Вязкость",
    "last_full_hour": "Последний полный часовой период",
    "volume_brutto_1": "Объем (брутто) - час",
    "quantity_brutto_1": "Количество (брутто) - час",
    "quantity_netto_1": "Количество (нетто) - час",
    "last_full_dayli": "Последний полный суточный период",
    "volume_brutto_2": "Объем (брутто) - сутки",
    "quantity_brutto_2": "Количество (брутто) - сутки",
    "quantity_netto_2": "Количество (нетто) - сутки",
    "last_full_shift": "Последний полный сменный период",
    "volume_brutto_3": "Объем (брутто) - смена",
    "quantity_brutto_3": "Количество (брутто) - смена",
    "quantity_netto_3": "Количество (нетто) - смена"
  };

  const handleTableClick = (filterTags = null, buttonTitle = "Sensor Data") => {
    let transformedData;

    if (filterTags && filterTags.length > 0) {
      // First filter
      const filtered = oilProgressData.filter(item => filterTags.includes(item.tag_key));

      // Sort by the order of filterTags array
      const sorted = filterTags.map(tag =>
        filtered.find(item => item.tag_key === tag)
      ).filter(Boolean); // remove any undefined if tag not found

      transformedData = sorted.map(item => ({
        "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
        "Показание": `${Math.round(item.value * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
      }));
    } else {
      transformedData = oilProgressData.map(item => ({
        "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
        "Показание": `${Math.round((item.tag_value || item.value) * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
      }));
    }

    setTableData(transformedData);
    setTableTitle(buttonTitle);
    setShowTable(true);
  };


  // Handle Uzel Ucheta click to show all related data
  const handleUzelUchetaClick = () => {
    const uzelUchetaTags = [
      "overpressure", "temperature", "volumetric_flow", "volume", "consumption_brutto", 
      "quantity_brutto", "consumption_netto", "quantity_netto", "normal_operating_time",
      "time_nonstandard_situations", "density_petroleum_liquid", "density_oil_20", 
      "density_oil_15", "moisture_volume", "moisture_weight", "viscosity", 
      "last_full_hour", "volume_brutto_1", "quantity_brutto_1", "quantity_netto_1",
      "last_full_dayli", "volume_brutto_2", "quantity_brutto_2", "quantity_netto_2",
      "last_full_shift", "volume_brutto_3", "quantity_brutto_3", "quantity_netto_3"
    ];
    
    const transformedData = oilProgressData
      .filter(item => uzelUchetaTags.includes(item.tag_key))
      .map(item => {
        // Handle both possible field names from your inconsistent data structure
        const value = item.value || item.tag_value || "";
        return {
          "Параметр": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
          "Значение": value === "" ? "—" : `${Math.round(parseFloat(value) * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
        };
      });
    
    setTableData(transformedData);
    setTableTitle("Узел учета");
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const tableDataStatic = [
    "t вход: 0.0°C",
    "t выход: 0.0°C",
    "p вход: 0.1кг/см²",
    "p выход: 0.0кг/см²",
  ];

  const getRealUzelUchetaData = () => {
    const displayTags = [
      "overpressure",
      "temperature", 
      "volumetric_flow",
      "volume",
      "consumption_brutto",
      "quantity_brutto",
      "moisture_volume"
    ];

    return displayTags.map(tag => {
      const item = oilProgressData.find(d => d.tag_key === tag);
      if (!item) return { value: "0.00", unit: TAG_UNITS[tag] || "" };
      
      // Handle both possible field names and round to 2 decimal places
      const rawValue = item.value || item.tag_value || 0;
      const value = Number(rawValue).toFixed(2);
      const unit = TAG_UNITS[tag] || "";
      
      return { value, unit };
    });
  };

  const fetchVlagomerData = async (date = null) => {
    setVlagomerLoading(true);
    try {
      let response;
      if (date) {
        // Fetch archive data for specific date
        const dateString = format(date, "yyyy-MM-dd");
        response = await fetchVlagomerHistory(dateString);
      } else {
        // Fetch current data
        response = await fetchVlagomerHistory();
      }
      
      const processedData = response.data
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-20)
        .map(item => ({
          time: format(parseISO(item.timestamp), 'HH:mm'),
          value: Math.round(item.value * 100) / 100,
          fullTimestamp: item.timestamp
        }));
      
      setVlagomerData(processedData);
    } catch (error) {
      console.error("Не удалось загрузить историю влагомера:", error);
      setVlagomerData([]);
    } finally {
      setVlagomerLoading(false);
    }
  };

  const loadAvailableVlagomerDates = async () => {
    try {
      const response = await getAvailableVlagomerDates();
      setAvailableVlagomerDates(response.data || []);
    } catch (error) {
      console.error("Error fetching available vlagomer dates:", error);
      setAvailableVlagomerDates([]);
    }
  };

  const parsedAvailableVlagomerDates = useMemo(() => {
    return availableVlagomerDates
      .map((d) => {
        try {
          const parsedDate = parseISO(d.date);
          if (isNaN(parsedDate.getTime())) {
            const [year, month, day] = d.date.split("-");
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          return parsedDate;
        } catch (error) {
          console.warn("Failed to parse vlagomer date:", d.date, error);
          return null;
        }
      })
      .filter((date) => date !== null && !isNaN(date.getTime()));
  }, [availableVlagomerDates]);

  // const generateVlagomerMockData = () => {
  //   const now = new Date();
  //   const data = [];
    
  //   // Generate 20 data points over the last 40 minutes (every 2 minutes)
  //   for (let i = 19; i >= 0; i--) {
  //     const time = new Date(now.getTime() - (i * 2 * 60 * 1000));
      
  //     // Use a base value between 15-25% for realistic moisture content
  //     const baseValue = 20;
  //     const variation = (Math.random() - 0.5) * 8; // ±4% variation
  //     const value = Math.max(0, Math.min(100, baseValue + variation)); // Keep between 0-100%
      
  //     data.push({
  //       time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  //       value: Math.round(value * 100) / 100,
  //       fullTimestamp: time.toISOString()
  //     });
  //   }
    
  //   setVlagomerData(data);
  // };

  const handleVlagomerDateChange = (date) => {
    if (date) {
      setSelectedVlagomerDate(date);
      setIsVlagomerArchiveMode(true);
      setShowVlagomerChart(true);
      fetchVlagomerData(date);
    }
  };

  const handleVlagomerReset = () => {
    setIsVlagomerArchiveMode(false);
    setSelectedVlagomerDate(null);
    fetchVlagomerData();
  };

  const handleVlagomerClick = () => {
    setShowVlagomerChart(true);
    fetchVlagomerData();
  };

  const handleCloseVlagomerChart = () => {
    setShowVlagomerChart(false);
  };

  const realUzelUchetaData = getRealUzelUchetaData();

  // Array of objects for dynamically creating LabelBox + Table/Indicator/Pumps components with percentage positions
  const componentData = [
    { top: "2.5%", left: "22.5%", content: "ГПС-1" },
    {
      top: "16.2%",
      left: "84.6%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"}/>
          <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
        </>
      ),
    },
    {
      top: "36.1%",
      left: "19.9%",
      content: (
        <>
          <div 
            onClick={handleVlagomerClick}
            style={{ cursor: "pointer" }}
          >
            <Indicator 
              indicatorNumber={Math.round((oilProgressData.find(d => d.tag_key === "VlagomerTFS_1")?.value || oilProgressData.find(d => d.tag_key === "VlagomerTFS_1")?.tag_value || 0) * 100) / 100} 
              indicatorUnits={"%"}
            />
            <LabelBox label={"Влагомер"} width={60} height={5} fontSize={10} />
          </div>
        </>
      ),
    },
    {
      top: "16.2%",
      left: "75.8%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
        </>
      ),
    },
    { top: "10.5%", left: "22.5%", content: "ГПС-2" },
    { top: "18%", left: "22.5%", content: "ГПС-3" },
    {
      top: "54%",
      left: "30.75%",
      content: (
        <>
          <div 
            onClick={handleUzelUchetaClick}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <LabelBox
              label={"Узел учета"}
              width={175}
              height={18}
              fontSize={10}
            />
            <div style={{transform: "scale(1.3)", transformOrigin: "top center"}}>
              <Table data={realUzelUchetaData} />
            </div>
          </div>                    
        </>
      ),
    },
    // {
    //   top: "27%",
    //   left: "50.35%",
    //   content: (
    //     <>
    //         <div style={{ flex: 0.5, width: "100%", fontSize: "11px" }}>
    //           <SimpleTable data={tableDataStatic.slice(0, 2)} />
    //         </div>
      

    //       <LabelBox label={"Печь"} width={205} height={10} fontSize={12} />
    //     </>

    //   )
    // },
    // {
    //   top: "27%",
    //   left: "55.75%",
    //   content: (
    //     <>
  
    //         <div style={{ flex: 0.5, width: "100%", display: "flex", justifyContent: "flex-end", fontSize: "11px" }}>
    //           <SimpleTable data={tableDataStatic.slice(2, 4)} />
    //         </div>
         

          
    //     </>

    //   )
    // },
    {
      top: "85%",
      left: "83.7%",
      content: (
        <>
          <Pumps numberOfSquares={4} activeIndex={0} width={41} height={52} />
          <LabelBox
            label={"Насосная пожаротушения"}
            width={150}
            height={10}
            fontSize={10}
          />
        </>
      ),
    },
    {
      top: "27%",
      left: "31.2%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={85} height={50} />
          <LabelBox
            label={"Насосная перекачка нефти"}
            width={150}
            height={10}
            fontSize={10}
          />
        </>
      ),
    },
    {
      top: "54%", // Label for PBC-1
      left: "52%",
      content: "PBC-1",
      color: "#000",
      size: "11px",
    },
    {
      top: "58%", // Label for PBC-1
      left: "52%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "74%", // Label for PBC-2
      left: "52%",
      content: "PBC-2",
      color: "#000",
      size: "11px",
    },
    {
      top: "78%", // Label for PBC-2
      left: "52%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "54%", // Label for PBC-3
      left: "64.5%",
      content: "PBC-3",
      color: "#000",
      size: "11px",
    },
    {
      top: "58%", // Label for PBC-3
      left: "64.5%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "78%", // Label for PBC-4
      left: "64.5%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "74%", // Label for PBC-4
      left: "64.5%",
      content: "PBC-4",
      color: "#000",
      size: "11px",
    },

    // Water
    {
      top: "70.2%", // Label for PBC-1
      left: "84.8%",
      content: "PBC-1",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-1
      left: "84.8%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "50%", // Label for PBC-2
      left: "84.8%",
      content: "PBC-2",
      color: "#000",
      size: "10px",
    },
    {
      top: "54.8%", // Label for PBC-2
      left: "84.8%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
    {
      top: "50%", // Label for PBC-3
      left: "93.5%",
      content: "PBC-3",
      color: "#000",
      size: "10px",
    },
    {
      top: "54.8%", // Label for PBC-3
      left: "93.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "70.2%", // Label for PBC-4
      left: "93.5%",
      content: "PBC-4",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-4
      left: "93.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
    //Tables
    {
      top: "38%",
      left: "24.6%",
      content: (
        <div 
          onClick={() => handleTableClick(
            [ "ARM_TFS_LC1_L", "ARM_LSA2_TFS", "ARM_TFS_LC1_H2O", "ARM_PT1_TFS", "ARM_TT1_TFS"], 
            "ТФС-1"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "40px",
            height: "20px",
            cursor: "pointer",
          }}
        />

      ),
    },
    {
      top: "23.4%",
      left: "24.6%",
      content: (
        <div 
          onClick={() => handleTableClick(
            [ "ARM_LC_L_TFS2", "ARM_LSA2_TFS2", "ARM_LC_I_TFS2", "ARM_PT1_TFS2", "ARM_TT1_TFS2"], 
            "ТФС-2"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "40px",
            height: "20px",
            cursor: "pointer",
          }}
        />

      ),
    },
    {
      top: "11%",
      left: "46.5%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_OGN_LC2_H2O", "ARM_OGN_LC2_L", "ARM_PT2_OGN", "ARM_TT2_OGN"], 
            "ОГН"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "80px",
            height: "50px",
            cursor: "pointer",
          }}
        />

      ),
    },
    {
      top: "11%",
      left: "56.2%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_ADG_LC3_H2O", "ARM_ADG_LC3_L", "ARM_PT3_ADG", "ARM_TT3_ADG"], 
            "ЭДГ"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "80px",
            height: "50px",
            cursor: "pointer",
          }}
        />

      ),
    },
    {
      top: "28.3%",
      left: "27.2%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_LSA4_GS", "ARM_PDT1_GS", "ARM_PT5_GS", "ARM_TT5_GS"], 
            "ГС"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "29px",
            height: "55px",
            cursor: "pointer",
          }}
        />

      ),
    },
    {
      top: "18%",
      left: "63.7%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_LSA3_KSU", "ARM_PT4_KSU", "ARM_TT4_KSU"], 
            "КСУ"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "38px",
            height: "105px",
            cursor: "pointer",
          }}
        />

      ),
    }
  ];

  // Array for ProgressBars with percentage positions
  const progressBarData = [
    {
      top: "52.7%",
      left: "54.7%",
      key: "rvs-1",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS1_LT")?.value || 0),
      maxValue: 1000,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "RVS-1",
      labelTop: "12%",
      labelLeft: "60.3%",
    },
    {
      top: "73%",
      left: "54.7%",
      key: "rvs-2",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS2_LT")?.value || 0),
      maxValue: 1000,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "RVS-2",
      labelTop: "7%",
      labelLeft: "89%",
    },
    {
      top: "52.7%",
      left: "67.3%",
      key: "rvs-3",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS7_LT")?.value || 0),
      maxValue: 1000,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "RVS-3",
      labelTop: "17%",
      labelLeft: "107%",
    },
    {
      top: "73%",
      left: "67.3%",
      key: "rvs-4",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS8_LT")?.value || 0),
      maxValue: 1000,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "RVS-4",
      labelTop: "7%",
      labelLeft: "107%",
    },

    // Additional 4 progress bars with blue color
    {
      // 2
      top: "49.2%",
      left: "86.8%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS6_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 5",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      // 3
      top: "49.2%",
      left: "95.4%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS5_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 6",
      labelTop: "27%",
      labelLeft: "60%",
    },

    {
      // 4
      top: "69.3%",
      left: "95.4%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS3_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 7",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      // 1
      top: "69.3%",
      left: "86.8%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS4_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 8",
      labelTop: "27%",
      labelLeft: "60%",
    },
    // progress bars for EP-1,2,3
    {
      top: "24%",
      left: "54.5%",
      key: "ep1",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_EP1_LT")?.value || 0),
      maxValue: 500,
      color: "green",
      width: 9,
      height: 34,
      label: "Progress 9",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "30.5%",
      left: "54.5%",
      key: "ep2",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_EP2_LT")?.value || 0),
      maxValue: 500,
      color: "green",
      width: 9,
      height: 34,
      label: "Progress 10",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "37%",
      left: "54.5%",
      key: "ep3",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_EP3_LT")?.value || 0),
      maxValue: 500,
      color: "green",
      width: 9,
      height: 34,
      label: "Progress 11",
      labelTop: "27%",
      labelLeft: "60%",
    }
  ];

  return (
    <div className={styles.navWrapper}>
      <AppNav />

      <div className={styles.container}>
        <img src={SchemeMain} alt="Diagram" className={styles.svg} />

        <div className={styles.overlay}>
          {/* Dynamically render components */}
          {componentData.map((item, index) => (
            <div
              key={index}
              className={`${styles.box} ${styles.textBox}`}
              style={{
                top: item.top,
                left: item.left,
                color: item.color,
                fontSize: item.size,
              }}
            >
              {item.content}
            </div>
          ))}

          {progressBarData.map((progressBar, index) => (
            <div
              key={index}
              className={`${styles.box} ${styles.textBox}`}
              style={{ top: progressBar.top, left: progressBar.left }}
            >
              <ProgressBar
                key={progressBar.key}
                value={progressBar.value}
                maxValue={progressBar.maxValue}
                color={progressBar.color}
                width={progressBar.width}
                height={progressBar.height}
              />
            </div>
          ))}
        </div>

        {/* <div
          className={`${styles.box} ${styles.textBox}`}
          style={{ top: "48%", left: "78.4%" }}
        >
          <Indicator indicatorNumber={69.3} indicatorUnits={"т/ч"} />
          <Indicator indicatorNumber={86.8} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={60} height={3} fontSize={10} />
        </div> */}
        <div
          className={`${styles.box} ${styles.textBox}`}
          style={{ top: "27%", left: "12%" }}
        >
          <NavLink to="/">
            <LabelBox label={"На главную"} width={80} height={30} fontSize={10}/>
          </NavLink>
        </div>
      </div>

      {showTable && (
        <Modal onClose={handleCloseTable}>
          <div style={{ padding: "20px" }}>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: "20px",
              fontSize: "24px",
              color: "white"
            }}>
              {tableTitle}
            </h2>
            {tableData.length > 0 && (
              <div style={{ 
                overflow: "auto",
                maxHeight: "70vh"
              }}>
                <ResponsiveTable data={tableData} />
              </div>
            )}
          </div>
        </Modal>
      )}

      {showVlagomerChart && (
        <Modal onClose={handleCloseVlagomerChart}>
          <div style={{ padding: "20px", minWidth: "700px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: "24px",
                color: "white"
              }}>
                Влагомер - Изменения во времени
              </h2>
              
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <DatePicker
                  selected={selectedVlagomerDate}
                  onChange={handleVlagomerDateChange}
                  highlightDates={parsedAvailableVlagomerDates}
                  placeholderText="Выберите дату"
                  className="custom-datepicker"
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "8px 12px"
                  }}
                />
                
                {isVlagomerArchiveMode && (
                  <button 
                    onClick={handleVlagomerReset}
                    style={{
                      backgroundColor: "#4a90e2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    🔄 Текущие данные
                  </button>
                )}
              </div>
            </div>
            
            {vlagomerLoading && (
              <div style={{ 
                color: "white", 
                textAlign: "center", 
                padding: "20px",
                fontSize: "16px"
              }}>
                ⏳ Загрузка данных...
              </div>
            )}

            {!vlagomerLoading && vlagomerData.length === 0 && (
              <div style={{ 
                color: "#ff6b6b", 
                textAlign: "center", 
                padding: "40px",
                fontSize: "16px",
                backgroundColor: "#2a1f1f",
                borderRadius: "8px",
                border: "1px solid #ff6b6b"
              }}>
                ❌ Ошибка загрузки данных влагомера. Проверьте подключение к API.
              </div>
            )}
            
            {!vlagomerLoading && vlagomerData.length > 0 && (
              <>
                <div style={{ 
                  backgroundColor: "#1a1a1a",
                  borderRadius: "8px",
                  padding: "20px",
                  height: "250px",
                  border: "1px solid #333" 
                }}>
                  <LineChart
                    width={650}
                    height={350}
                    data={vlagomerData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      tick={{ fill: "#e5e5e5" }}
                      axisLine={{ stroke: "#666" }}
                      tickLine={{ stroke: "#666" }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Влажность (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#e5e5e5' }
                      }}
                      fontSize={12}
                      tick={{ fill: "#e5e5e5" }}
                      axisLine={{ stroke: "#666" }}
                      tickLine={{ stroke: "#666" }}
                    />
                    <Tooltip 
                      content={<VlagomerTooltip />}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#e5e5e5' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Влажность"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                  </LineChart>
                </div>
                
                <div style={{ 
                  marginTop: "15px", 
                  color: "white", 
                  fontSize: "12px",
                  textAlign: "center"
                }}>
                  Последние 20 измерений • 
                  {isVlagomerArchiveMode && selectedVlagomerDate ? 
                    `Архив: ${format(selectedVlagomerDate, "dd.MM.yyyy")}` : 
                    `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`
                  }
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}