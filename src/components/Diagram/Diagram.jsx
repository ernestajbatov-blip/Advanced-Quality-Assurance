import React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { useUser } from "../../states/UserContext";
import Furnace from "../Furnace/Furnace";

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
          {`Обводненность: ${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Diagram() {
  const { user, onLogout } = useUser();
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
  const [vlagomerAverage, setVlagomerAverage] = useState(0);
  const [currentTableFilterTags, setCurrentTableFilterTags] = useState(null);

  const apiBaseURL = process.env.NODE_ENV === "production" 
    ? "http://192.168.1.42:3000/api" 
    : "http://localhost:3000/api";

  const fetchOilProgressData = useCallback(() => {
    axios.get(`${apiBaseURL}/progress-oil`)
      .then(res => {
        setOilProgressData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch oil progress data", err);
      });
  }, [apiBaseURL]);

  useEffect(() => {
    // Fetch immediately on mount
    fetchOilProgressData();

    // Set up polling interval 
    const intervalId = setInterval(() => {
      fetchOilProgressData();
    }, 2000); 

    // Cleanup: clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOilProgressData]);

  useEffect(() => {
    loadAvailableVlagomerDates();
  }, []);

  // Calculate 24-hour average whenever vlagomerData changes
  useEffect(() => {
    if (vlagomerData.length > 0) {
      const sum = vlagomerData.reduce((acc, item) => acc + item.value, 0);
      const avg = sum / vlagomerData.length;
      setVlagomerAverage(Math.round(avg * 100) / 100);
    }
  }, [vlagomerData]);

  useEffect(() => {
    // Load vlagometer data immediately when component mounts
    fetchVlagomerData();
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
    "VlagomerTFS_1": "м3/ч",

    // PNK-1
    "ARM_PNK1_LC": "°C",
    "ARM_PNK1_PT": "°C",
    // "ARM_PNK1_TT": "МПа",

    // PNK-2
    "ARM_PNK2_LC": "°C",
    "ARM_PNK2_PT": "°C",
    // "ARM_PNK2_TT": "МПа",

    // PP-0,63
    "ARM_PP063_LC": "°C",
    "ARM_PP063_PT": "°C",
    // "ARM_PP063_TT": "МПа",

    // МФН-1
    "mfn_1_pump_t": "°C",
    "mfn_1_pump_in_pressure": "бар",
    "mfn_1_pump_out_pressure": "бар", 
    "mfn_1_freq": "Гц",
    "mfn_1_work_time": "",
    "mfn_1_current": "кВт",
    "mfn_1_speed": "об/мин",
    "mfn_1_pump_set_pressure": "бар",
    "mfn_1_power": "А",
    "mfn_1_rotor_speed": "об/мин",

    // МФН-2
    "mfn_2_pump_t": "°C",
    "mfn_2_pump_in_pressure": "бар",
    "mfn_2_pump_out_pressure": "бар",
    "mfn_2_set_freq": "Гц",
    // "mfn_2_freq": "Гц",
    "mfn_2_work_time": "",
    "mfn_2_power": "кВт",
    "mfn_2_speed": "об/мин",
    "mfn_2_pump_set_pressure": "бар",
    "mfn_2_current": "А",
    "mfn_2_rotor_speed": "об/мин",

    // Насосная перекачка нефти
    "Rabota_nasos__1-NPS": "",
    "Rabota_nasos_2_NPS": "",
    "Zadanie_Hz_nasos_NPS_1": "Гц",
    "Zadanie_Hz_nasos_NPS_2": "Гц",
    "ARM_NPS_1PT1_IN_R": "атм",
    "ARM_NPS_2PT1_IN_L": "атм",
    "Pusk_nasos_1_NPS": "",
    "Pusk_nasos_2_NPS": "",
    "Stop_nasos_1_NPS": "",
    "Stop_nasos_2_NPS": "",

    // Счетчики
    "gas_1_consumption": "м3",
    "gas_1_acc_cons": "м3",
    "gas_1_abs_pressure": "атм",
    "PNK1_TEMPERATURA": "°C",
    "gas_2_consumption": "м3",
    "gas_2_acc_cons": "м3",
    "gas_2_abs_pressure": "атм",
    "gas_2_temp": "°C",
    "gas_3_consumption": "м3",
    "gas_3_acc_cons": "м3",
    "gas_3_abs_pressure": "атм",
    "gas_3_temp": "°C",

    // BKNS
    "gnu_1_freq": "Гц",
    "gnu_1_voltage": "В",
    "gnu_1_current": "А",
    "gnu_1_power": "кВт",
    "gnu_1_speed": "об/мин",
    "gnu_1_temp": "°C",
    "gnu_1_nagn": "м3",
    "gnu_1_nakop": "м3",
    "gnu_1_consumption": "м3",
    "gnu_2_freq": "Гц",
    "gnu_2_voltage": "В",
    "gnu_2_current": "А",
    "gnu_2_power": "кВт",
    "gnu_2_speed": "об/мин",
    "gnu_2_temp": "°C",
    "gnu_2_nagn": "м3",
    "gnu_2_nakop": "м3",
    "gnu_2_consumption": "м3",
    "gnu_3_freq": "Гц",
    "gnu_3_voltage": "В",
    "gnu_3_current": "А",
    "gnu_3_power": "кВт",
    "gnu_3_speed": "об/мин",
    "gnu_3_temp": "°C",
    "gnu_3_nagn": "м3",
    "gnu_3_nakop": "м3",
    "gnu_3_consumption": "м3",
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

    // PNK-1
    "ARM_PNK1_LC": "Темп. вход",
    "ARM_PNK1_PT": "Темп. выход",
    // "ARM_PNK1_TT": "Давление",

    // PNK-2
    "ARM_PNK2_LC": "Темп. вход",
    "ARM_PNK2_PT": "Темп. выход",
    // "ARM_PNK2_TT": "Давление",

    // PP-0,63
    "ARM_PP063_LC": "Темп. вход",
    "ARM_PP063_PT": "Темп. выход",
    // "ARM_PP063_TT": "Давление",

    // МФН-1
    "mfn_1_pump_t": "Темп. насоса",
    "mfn_1_pump_in_pressure": "Давление вход.",
    "mfn_1_pump_out_pressure": "Давление выход.",
    // "mfn_1_set_freq": "Задание частоты",
    "mfn_1_freq": "Частота",
    "mfn_1_work_time": "Время работы",
    "mfn_1_current": "Мощность",
    "mfn_1_speed": "Обороты двигателя",
    "mfn_1_pump_set_pressure": "Задание давления",
    "mfn_1_power": "Ток",
    "mfn_1_rotor_speed": "Скорость ротора",

    // МФН-2
    "mfn_2_pump_t": "Темп. насоса",
    "mfn_2_pump_in_pressure": "Давление вход.",
    "mfn_2_pump_out_pressure": "Давление выход.",
    "mfn_2_set_freq": "Частота",
    // "mfn_2_freq": "Частота",
    "mfn_2_work_time": "Время работы",
    "mfn_2_power": "Мощность",
    "mfn_2_speed": "Обороты двигателя",
    "mfn_2_pump_set_pressure": "Задание давления",
    "mfn_2_current": "Ток",
    "mfn_2_rotor_speed": "Скорость ротора",

    // Насосная перекачка нефти
    "Rabota_nasos__1-NPS": "Статус работы",
    "Rabota_nasos_2_NPS": "Статус работы", 
    "Zadanie_Hz_nasos_NPS_1": "Частота",
    "Zadanie_Hz_nasos_NPS_2": "Частота",
    "ARM_NPS_1PT1_IN_R": "Давление на входе",
    "ARM_NPS_2PT1_IN_L": "Давление на входе",
    "Pusk_nasos_1_NPS": "Команда пуск",
    "Pusk_nasos_2_NPS": "Команда пуск",
    "Stop_nasos_1_NPS": "Команда стоп",
    "Stop_nasos_2_NPS": "Команда стоп",

    // Счетчик ПНК
    "gas_1_consumption": "Мгновенный расход",
    "gas_1_acc_cons": "Накопленный расход",
    "gas_1_abs_pressure": "Давление",
    "gas_1_temp": "Температура",

    "gas_2_consumption": "Мгновенный расход",
    "gas_2_acc_cons": "Накопленный расход",
    "gas_2_abs_pressure": "Давление",
    "gas_2_temp": "Температура",

    "gas_3_consumption": "Мгновенный расход",
    "gas_3_acc_cons": "Накопленный расход",
    "gas_3_abs_pressure": "Давление",
    "gas_3_temp": "Температура",

    // BKNS
    "gnu_1_freq": "Частота",
    "gnu_1_voltage": "Напряжение",
    "gnu_1_current": "Ток",
    "gnu_1_power": "Мощность",
    "gnu_1_speed": "Скорость",
    "gnu_1_temp": "Температура",
    "gnu_1_nagn": "Мгновенный расход",
    "gnu_1_nakop": "Накопленный расход",
    "gnu_1_consumption": "Мгновенный расход",

    "gnu_2_freq": "Частота",
    "gnu_2_voltage": "Напряжение",
    "gnu_2_current": "Ток",
    "gnu_2_power": "Мощность",
    "gnu_2_speed": "Скорость",
    "gnu_2_temp": "Температура",
    "gnu_2_nagn": "Мгновенный расход",
    "gnu_2_nakop": "Накопленный расход",
    "gnu_2_consumption": "Мгновенный расход",

    "gnu_3_freq": "Частота",
    "gnu_3_voltage": "Напряжение",
    "gnu_3_current": "Ток",
    "gnu_3_power": "Мощность",
    "gnu_3_speed": "Скорость",
    "gnu_3_temp": "Температура",
    "gnu_3_nagn": "Мгновенный расход",
    "gnu_3_nakop": "Накопленный расход",
    "gnu_3_consumption": "Мгновенный расход",

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
  setCurrentTableFilterTags(filterTags);
  
  let transformedData;
  if (filterTags && filterTags.length > 0) {
    const filteredData = oilProgressData.filter(item => filterTags.includes(item.tag_key));
    
    // Sort by the order of original filterTags array
    const sorted = filterTags.map(tag =>
      filteredData.find(item => item.tag_key === tag)).filter(Boolean);
    

    transformedData = sorted.map(item => {
      let value = item.value || item.tag_value;

    // Handle boolean values specifically
    if (value === "True" || value === true) {
      value = "Включен";
    } else if (value === "False" || value === false) {
      value = "Выключен";
    } else if (item.tag_key.includes('work_time')) {
      // Special handling for work_time values
      value = value.toString();
    } else if (typeof value === 'number') {
      value = `${value.toFixed(2)} ${TAG_UNITS[item.tag_key] || ''}`.trim();
    } else {
      // Try to parse as number for non-boolean string values
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        value = `${numValue.toFixed(2)} ${TAG_UNITS[item.tag_key] || ''}`.trim();
      } else {
        value = `${value} ${TAG_UNITS[item.tag_key] || ''}`.trim();
      }
    }

      // Map tag keys to descriptive names for the table
      return {
        "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
        "Показание": value
      };
    });

    // For GNU pumps, show "Нет данных" if entries don't exist
    if (buttonTitle.includes("ГНУ")) {
      const expectedEntries = [
        { "Датчик": "Температура", "Показание": "Нет данных" },
        { "Датчик": "Мгновенный расход", "Показание": "Нет данных" },
        { "Датчик": "Накопленный расход", "Показание": "Нет данных" }
      ];

      expectedEntries.forEach(expectedEntry => {
        const exists = transformedData.some(existingItem => existingItem["Датчик"] === expectedEntry["Датчик"]);
        if (!exists) {
          transformedData.push(expectedEntry);
        }
      });
    }

  } else {
    // Default transformation if no specific tags are provided
    transformedData = oilProgressData.map(item => {
      let value = item.value;
      
      if (value !== undefined && value !== null) {
        if (item.tag_key.includes('work_time')) {
          value = value.toString();
        } else {
          value = `${value} ${TAG_UNITS[item.tag_key] || ''}`.trim();
        }
      } else {
        value = "N/A";
      }
      
      return {
        "Параметр": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
        "Значение": value
      };
    });
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

  // Auto-refresh table data when modal is open
  useEffect(() => {
    if (!showTable) return;

    const intervalId = setInterval(() => {
      // Re-transform the data based on the current table
      if (tableTitle === "Узел учета") {
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
            const value = item.value || item.tag_value || "";
            return {
              "Параметр": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
              "Значение": value === "" ? "—" : `${Math.round(parseFloat(value) * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
            };
          });
        
        setTableData(transformedData);
      } else if (currentTableFilterTags && currentTableFilterTags.length > 0) {
        // Refresh data for other tables using stored filter tags
        const filteredData = oilProgressData.filter(item => currentTableFilterTags.includes(item.tag_key));
        const sorted = currentTableFilterTags.map(tag =>
          filteredData.find(item => item.tag_key === tag)).filter(Boolean);
        
        const transformedData = sorted.map(item => {
          let value = item.value || item.tag_value;

          if (value === "True" || value === true) {
            value = "Включен";
          } else if (value === "False" || value === false) {
            value = "Выключен";
          } else if (item.tag_key.includes('work_time')) {
            value = value.toString();
          } else if (typeof value === 'number') {
            value = `${value.toFixed(2)} ${TAG_UNITS[item.tag_key] || ''}`.trim();
          } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              value = `${numValue.toFixed(2)} ${TAG_UNITS[item.tag_key] || ''}`.trim();
            } else {
              value = `${value} ${TAG_UNITS[item.tag_key] || ''}`.trim();
            }
          }

          return {
            "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
            "Показание": value
          };
        });

        // Handle GNU pumps special case
        if (tableTitle.includes("ГНУ")) {
          const expectedEntries = [
            { "Датчик": "Температура", "Показание": "Нет данных" },
            { "Датчик": "Мгновенный расход", "Показание": "Нет данных" },
            { "Датчик": "Накопленный расход", "Показание": "Нет данных" }
          ];

          expectedEntries.forEach(expectedEntry => {
            const exists = transformedData.some(existingItem => existingItem["Датчик"] === expectedEntry["Датчик"]);
            if (!exists) {
              transformedData.push(expectedEntry);
            }
          });
        }

        setTableData(transformedData);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [showTable, tableTitle, oilProgressData, currentTableFilterTags]);

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
        .slice(-24) // Changed from -20 to -24
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

  // const generateRandomSensorData = (tags) => {
  //   // Filter out gas_*_consumption tags only
  //   const filteredTags = tags.filter(tag => !(tag.includes('gas_') && tag.includes('_consumption')));
    
  //   return filteredTags.map(tag => {
  //     let value;
  //     if (tag.includes('BKNS') && tag.includes('TEMP')) { // BKNS Temperature
  //       value = (Math.random() * 30 + 50).toFixed(2); // 50-80°C
  //     } else if (tag.includes('BKNS') && tag.includes('CURRENT')) { // BKNS Current
  //       value = (Math.random() * 30 + 15).toFixed(2); // 15-45 A
  //     } else if (tag.includes('BKNS') && tag.includes('POWER')) { // BKNS Power
  //       value = (Math.random() * 40 + 30).toFixed(2); // 30-70 kW
  //     } else if (tag.includes('BKNS') && tag.includes('FLOW')) { // BKNS Accumulated Flow
  //       value = (Math.random() * 5000 + 10000).toFixed(2); // 10000-15000 m³
  //     } else if (tag.includes('MFN') && tag.includes('TEMP')) { // Temperature sensors for MFN
  //       value = (Math.random() * 60 + 40).toFixed(2); // 40-100°C
  //     } else if (tag.includes('P_IN')) { // Input pressure for MFN
  //       value = (Math.random() * 3 + 2).toFixed(2); // 2-5 atm
  //     } else if (tag.includes('P_OUT')) { // Output pressure for MFN 
  //       value = (Math.random() * 2 + 4).toFixed(2); // 4-6 atm
  //     } else if (tag.includes('CURRENT')) { // Current
  //       value = (Math.random() * 20 + 10).toFixed(2); // 10-30 A
  //     } else if (tag.includes('POWER')) { // Power
  //       value = (Math.random() * 50 + 25).toFixed(2); // 25-75 kW
  //     } else if (tag.includes('FREQ')) { // Frequency
  //       value = (Math.random() * 10 + 45).toFixed(2); // 45-55 Hz
  //     } else if (tag.includes('gnu_') && tag.includes('_voltage')) { // GNU Voltage
  //       value = (Math.random() * 50 + 350).toFixed(2); // 350-400 V
  //     } else if (tag.includes('gnu_') && tag.includes('_speed')) { // GNU Speed
  //       value = (Math.random() * 200 + 1400).toFixed(2); // 1400-1600 rpm
  //     } else if (tag.includes('gnu_') && tag.includes('_temp')) { // GNU Temperature - SET TO 0
  //       value = "---";
  //     } else if (tag.includes('gnu_') && tag.includes('_nagn')) { // GNU Instant flow - SET TO 0
  //       value = "---";
  //     } else if (tag.includes('gnu_') && tag.includes('_nakop')) { // GNU Accumulated - SET TO 0
  //       value = "---";
  //     } else if (tag.includes('PNK') && (tag.includes('LC') || tag.includes('PT'))) { 
  //       // Temperature sensors for PNK
  //       value = (Math.random() * 80 + 60).toFixed(2); // 60-140°C
  //     } else if (tag.includes('PP063') && (tag.includes('LC') || tag.includes('PT'))) { 
  //       // Temperature sensors for PP-0,63
  //       value = (Math.random() * 80 + 60).toFixed(2); // 60-140°C
  //     } else if (tag.includes('TT')) { // Pressure sensors
  //       value = (Math.random() * 5 + 1).toFixed(2); // 1-6 atm or MPa
  //     } else {
  //       value = (Math.random() * 100).toFixed(2);
  //     }
      
  //     return {
  //       tag_key: tag,
  //       value: parseFloat(value)
  //     };
  //   });
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

  // Auto-refresh vlagomer data when chart is open (only for current data, not archive)
  useEffect(() => {
    if (!showVlagomerChart || isVlagomerArchiveMode) return;

    const intervalId = setInterval(() => {
      fetchVlagomerData();
    }, 2000); // Update every 2 seconds for current data

    return () => clearInterval(intervalId);
  }, [showVlagomerChart, isVlagomerArchiveMode]);

  const realUzelUchetaData = getRealUzelUchetaData();

  // Array of objects for dynamically creating LabelBox + Table/Indicator/Pumps components with percentage positions
  const componentData = [
    
    // {
    //   top: "16.2%",
    //   left: "84.6%",
    //   content: (
    //     <>
    //       <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"}/>
    //       <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
    //     </>
    //   ),
    // },
    {
      top: "36.1%",
      left: "17%",
      content: (
        <>
          <div 
            onClick={handleVlagomerClick}
            style={{ cursor: "pointer" }}
          >
            <div style={{ position: "relative" }}>
              <div title="Текущие показания влагомера">
                <Indicator 
                  indicatorNumber={Math.round((oilProgressData.find(d => d.tag_key === "VlagomerTFS_1")?.value || oilProgressData.find(d => d.tag_key === "VlagomerTFS_1")?.tag_value || 0) * 100) / 100} 
                  indicatorUnits={"%"}
                />
              </div>
              <div title="Среднее за 24 часа" style={{ marginTop: "2px" }}>
                <Indicator 
                  indicatorNumber={vlagomerAverage} 
                  indicatorUnits={"%"}
                />
              </div>
            </div>
            <LabelBox label={"Влагомер"} width={65} height={5} fontSize={10} />
          </div>
        </>
      ),
    },
    // {
    //   top: "16.2%",
    //   left: "75.8%",
    //   content: (
    //     <>
    //       <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
    //       <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
    //     </>
    //   ),
    // },
    // {
    //   top: "20%",
    //   left: "33%",
    //   content: (
    //     <>
    //       <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
    //       <LabelBox label={"Счетчик ГС"} width={65} height={5} fontSize={10} />
    //     </>
    //   ),
    // },
    // {
    //   top: "65%",
    //   left: "25.25%",
    //   content: (
    //     <>
    //       <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
    //       <LabelBox label={"Счетчик ГПС"} width={65} height={5} fontSize={10} />
    //     </>
    //   ),
    // },
    // {
    //   top: "11.5%",
    //   left: "33%",
    //   content: (
    //     <>
    //       <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"}/>
    //       <LabelBox label={"Счетчик ПНК"} width={65} height={5} fontSize={10} />
    //     </>
    //   ),
    // },
    { top: "45%", left: "22.5%", content: "ГПС-1" },
    { top: "53%", left: "22.5%", content: "ГПС-2" },
    { top: "60.5%", left: "22.5%", content: "ГПС-3" },
    // For МФН pumps with labels instead of icons
    {
      top: "5.5%",
      left: "21.6%",
      content: (
        <>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative"
            }}
          >
            <Pumps 
              numberOfSquares={2} 
              width={58} 
              height={40}
              pumpStatuses={[
                { 
                  tag: "mfn_1_status", 
                  status: oilProgressData.find(d => d.tag_key === "mfn_1_status")?.value || 0,
                  label: "МФН-1"
                },
                { 
                  tag: "mfn_2_status", 
                  status: oilProgressData.find(d => d.tag_key === "mfn_2_status")?.value || 0,
                  label: "МФН-2"
                }
              ]}
              vertical={true}
              gap={14}
              showLabels={true}
              fontSize={15}  // Make the labels smaller - adjust this value as needed
            />
            {/* МФН-1 clickable area */}
            <div
              onClick={() => handleTableClick(
                ["mfn_1_pump_t", "mfn_1_pump_in_pressure", "mfn_1_pump_out_pressure", "mfn_1_freq", "mfn_1_work_time", "mfn_1_power", "mfn_1_speed", "mfn_1_pump_set_pressure", "mfn_1_current", "mfn_1_rotor_speed"],
                "МФН-1"
              )}
              style={{
                position: "absolute",
                top: "0%",
                left: "0%",
                width: "55px",
                height: "47px",
                cursor: "pointer",
              }}
            />
            {/* МФН-2 clickable area */}
            <div
              onClick={() => handleTableClick(
                ["mfn_2_pump_t", "mfn_2_pump_in_pressure", "mfn_2_pump_out_pressure", "mfn_2_set_freq", "mfn_2_work_time", "mfn_2_power", "mfn_2_speed", "mfn_2_pump_set_pressure", "mfn_2_current", "mfn_2_rotor_speed"],
                "МФН-2"
              )}
              style={{
                position: "absolute",
                top: "50%",
                left: "0%",
                width: "55px",
                height: "47px",
                cursor: "pointer",
              }}
            />
          </div>
        </>
      ),
    },
    // { top: "7.5%", left: "22.25%", content: "МФН-1" },
    // { top: "15.25%", left: "22.25%", content: "МФН-2" },
    //   // МФН-1 clickable area
    // {
    //   top: "7.5%",
    //   left: "22.25%", 
    //   content: (
    //     <div 
    //       onClick={() => handleTableClick(
    //         ["mfn_1_pump_t", "mfn_1_pump_in_pressure", "mfn_1_pump_out_pressure", "mfn_1_freq", "mfn_1_work_time", "mfn_1_power", "mfn_1_speed", "mfn_1_pump_set_pressure", "mfn_1_current", "mfn_1_rotor_speed"], 
    //         "МФН-1"
    //       )}
    //       style={{
    //         position: "absolute",
    //         top: "0%",
    //         left: "0%",
    //         width: "60px",
    //         height: "40px",
    //         cursor: "pointer",
    //         // backgroundColor: "rgba(255, 255, 0, 0.1)", 
    //         // border: "1px solid rgba(255, 255, 0, 0.3)"
    //       }}
    //     />
    //   ),
    // },

    // // МФН-2 clickable area
    // {
    //   top: "15.25%",
    //   left: "22.25%", 
    //   content: (
    //     <div 
    //       onClick={() => handleTableClick(
    //         ["mfn_2_pump_t", "mfn_2_pump_in_pressure", "mfn_2_pump_out_pressure", "mfn_2_set_freq", "mfn_2_work_time", "mfn_2_power", "mfn_2_speed", "mfn_2_pump_set_pressure", "mfn_2_current", "mfn_2_rotor_speed"], 
    //         "МФН-2"
    //       )}
    //       style={{
    //         position: "absolute",
    //         top: "0%",
    //         left: "0%",
    //         width: "60px",
    //         height: "40px",
    //         cursor: "pointer",
    //         // backgroundColor: "rgba(255, 0, 255, 0.1)", // Optional: visible area for testing
    //         // border: "1px solid rgba(255, 0, 255, 0.3)"
    //       }}
    //     />
    //   ),
    // },
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
    // Счетчик ПНК clickable area
    {
      top: "12.6%",
      left: "41.65%", 
      content: (
        <div 
          onClick={() => handleTableClick(
            ["gas_1_consumption", "gas_1_acc_cons", "gas_1_abs_pressure", "gas_1_temp"], 
            "Счетчик ПНК"
          )}
          title="Счетчик ПНК"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            // backgroundColor: "rgba(255, 255, 0, 0.1)", 
            // border: "1px solid rgba(255, 255, 0, 0.3)"
          }}
        />
      ),
    },
    // Счетчик ГС clickable area
    {
      top: "26.5%",
      left: "28%",
      content: (
        <div
          onClick={() => handleTableClick(
            ["gas_2_consumption", "gas_2_acc_cons", "gas_2_abs_pressure", "gas_2_temp"], 
            "Счетчик ГС"
          )}
          title="Счетчик ГС"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            // backgroundColor: "rgba(212, 0, 255, 0.1)",
            // border: "1px solid rgba(0, 255, 255, 0.3)"
          }}
        />
      ),
    },
    // Счетчик ГПС clickable area
    {
      top: "53%",
      left: "26.75%",
      content: (
        <div
          onClick={() => handleTableClick(
            ["gas_3_consumption", "gas_3_acc_cons", "gas_3_abs_pressure", "gas_3_temp"], 
            "Счетчик ГПС"
          )}
          title="Счетчик ГПС"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            // backgroundColor: "rgba(255, 0, 21, 0.1)",
            // border: "1px solid rgba(0, 255, 255, 0.3)"
          }}
        />
      ),
    },
    // ПНК-1 clickable area
    {
      top: "23.9%", 
      left: "43.1%",
      content: (
        <div 
          onClick={() => handleTableClick(
            [
              "ARM_PNK1_LC", 
              "ARM_PNK1_PT", 
              // "ARM_PNK1_TT"
            ], 
            "ПНК-1"
          )}
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "60px",
            height: "40px",
            cursor: "pointer",
            // backgroundColor: "rgba(255, 0, 0, 0.1)", // Optional: visible area for testing
            // border: "1px solid rgba(255, 0, 0, 0.3)",
            zIndex: 1500,
          }}
        />
      ),
    },

    // ПНК-2 clickable area
    {
      top: "30.7%", 
      left: "43.1%", 
      content: (
        <div 
          onClick={() => handleTableClick(
            [
              "ARM_PNK2_LC", 
              "ARM_PNK2_PT", 
              // "ARM_PNK2_TT"
            ], 
            "ПНК-2"
          )}
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "60px",
            height: "40px",
            cursor: "pointer",
            zIndex: 1500,
            // backgroundColor: "rgba(0, 255, 0, 0.1)", // Optional: visible area for testing
            // border: "1px solid rgba(0, 255, 0, 0.3)"
          }}
        />
      ),
    },

    // ПП-0,63 clickable area
    {
      top: "37.3%", 
      left: "43.1%", 
      content: (
        <div 
          onClick={() => handleTableClick(
            [
              "ARM_PP063_LC", 
              "ARM_PP063_PT", 
              // "ARM_PP063_TT"
            ], 
            "ПП-0,63"
          )}
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "60px",
            height: "40px",
            cursor: "pointer",
            zIndex: 1500,
            // backgroundColor: "rgba(0, 0, 255, 0.1)", // Optional: visible area for testing
            // border: "1px solid rgba(0, 0, 255, 0.3)"
          }}
        />
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
      left: "79.4%",
      content: (
      <>
        <Pumps numberOfSquares={2} activeIndex={0} width={80} height={52} />
        <LabelBox
        label={"Насосная пожаротушения"}
        width={140}
        height={10}
        fontSize={10}
        />
      </>
      ),
    },
    {
      top: "34.5%",
      left: "91.2%",
      content: (
        <>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative"
            }}
          >
            <Pumps 
              numberOfSquares={3} 
              width={55} 
              height={52}
              pumpStatuses={[
                { 
                  tag: "gnu_1_status", 
                  status: oilProgressData.find(d => d.tag_key === "gnu_1_status")?.value || 0 
                },
                { 
                  tag: "gnu_2_status", 
                  status: oilProgressData.find(d => d.tag_key === "gnu_2_status")?.value || 0 
                },
                { 
                  tag: "gnu_3_status", 
                  status: oilProgressData.find(d => d.tag_key === "gnu_3_status")?.value || 0 
                }
              ]}
            />
            <LabelBox
              label={"БКНС"}
              width={150}
              height={10}
              fontSize={10}
            />
            {/* БКНС Pump 1 clickable area */}
            <div
              onClick={() => handleTableClick(
                ["gnu_1_freq", "gnu_1_voltage", "gnu_1_current", "gnu_1_power", "gnu_1_speed", "gnu_1_temp", "gnu_1_nagn", "gnu_1_nakop", "gnu_1_consumption"],
                "ГНУ-1"
              )}
              style={{
                position: "absolute",
                top: "0%",
                left: "0%",
                width: "55px",
                height: "52px",
                cursor: "pointer",
              }}
            />
            {/* БКНС Pump 2 clickable area */}
            <div
              onClick={() => handleTableClick(
                ["gnu_2_freq", "gnu_2_voltage", "gnu_2_current", "gnu_2_power", "gnu_2_speed", "gnu_2_temp", "gnu_2_nagn", "gnu_2_nakop", "gnu_2_consumption"],
                "ГНУ-2"
              )}
              style={{
                position: "absolute",
                top: "0%",
                left: "33%",
                width: "55px",
                height: "52px",
                cursor: "pointer",
              }}
            />
            {/* БКНС Pump 3 clickable area */}
            <div
              onClick={() => handleTableClick(
                ["gnu_3_freq", "gnu_3_voltage", "gnu_3_current", "gnu_3_power", "gnu_3_speed", "gnu_3_temp", "gnu_3_nagn", "gnu_3_nakop", "gnu_3_consumption"],
                "ГНУ-3"
              )}
              style={{
                position: "absolute",
                top: "0%",
                left: "67%",
                width: "55px",
                height: "52px",
                cursor: "pointer",
              }}
            />
          </div>
        </>
      ),
    },
    {
      top: "27.2%",
      left: "32%",
      content: (
      <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {(() => {
              const pump1Status = oilProgressData.find(d => d.tag_key === "Rabota_nasos__1-NPS");
              const pump2Status = oilProgressData.find(d => d.tag_key === "Rabota_nasos_2_NPS");
              
              let activeIndex = -1;
              // Changed from tag_value to value
              if (pump1Status && (pump1Status.value === "True" || pump1Status.value === true)) {
                activeIndex = 0;
              } else if (pump2Status && (pump2Status.value === "True" || pump2Status.value === true)) {
                activeIndex = 1;
              }
              
              return (
                <Pumps 
                  numberOfSquares={2} 
                  activeIndex={activeIndex}
                  width={80} 
                  height={50} 
                />
              );
            })()}
            
            <LabelBox
              label={"Насосная перекачка нефти"}
              width={140}
              height={10}
              fontSize={10}
            />
            {/* Насос 1 clickable area */}
            <div 
              onClick={() => handleTableClick(
                ["Rabota_nasos__1-NPS", "Pusk_nasos_1_NPS", "Stop_nasos_1_NPS", "Zadanie_Hz_nasos_NPS_1", "ARM_NPS_1PT1_IN_R"], 
                "Насос перекачки нефти №1"
              )}
              style={{
                position: "absolute",
                top: "7%",
                left: "4%",
                width: "80px",
                height: "50px",
                cursor: "pointer",
                // backgroundColor: "red"
              }}
            />
            {/* Насос 2 clickable area */}
            <div 
              onClick={() => handleTableClick(
                ["Rabota_nasos_2_NPS", "Pusk_nasos_2_NPS", "Stop_nasos_2_NPS", "Zadanie_Hz_nasos_NPS_2", "ARM_NPS_2PT1_IN_L"], 
                "Насос перекачки нефти №2"
              )}
              style={{
                position: "absolute",
                top: "7%",
                left: "50%",
                width: "80px", 
                height: "50px",
                cursor: "pointer",
                // backgroundColor: "green"

              }}
            />
          </div>
        </>
      ),
    },

    // Печи
    {
      top: "23%",
      left: "39.5%", 
      content: (
        <>
          <Furnace isActive={true} width={205} height={45} />
          
        </>
      )
    },
    { top: "25%", left: "43.4%", content: "ПНК-1", size: "15px" },
    {
      top: "29.5%",
      left: "39.5%", 
      content: (
        <>
          <Furnace isActive={true} width={205} height={45} />
          
        </>
      )
    },
    { top: "31.5%", left: "43.4%", content: "ПНК-2", size: "15px" },
    {
      top: "36%",
      left: "39.5%", 
      content: (
        <>
          <Furnace isActive={false} width={205} height={45} />
          
        </>
      )
    },
    { top: "38%", left: "43.1%", content: "ПП-0,63", size: "15px" },
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
      left: "78.5%",
      content: "PBC-1",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-1
      left: "78.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "50%", // Label for PBC-2
      left: "78.5%",
      content: "PBC-2",
      color: "#000",
      size: "10px",
    },
    {
      top: "54.8%", // Label for PBC-2
      left: "78.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
    {
      top: "50%", // Label for PBC-3
      left: "87.2%",
      content: "PBC-3",
      color: "#000",
      size: "10px",
    },
    {
      top: "54.8%", // Label for PBC-3
      left: "87.2%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "70.2%", // Label for PBC-4
      left: "87.2%",
      content: "PBC-4",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-4
      left: "87.2%",
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
      top: "38%",
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
            // backgroundColor: "red"
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
    },
    // Tooltip area 1
    {
      top: "30.8%",
      left: "91.8%",
      content: (
        <div 
          title="Расходомер 1"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
        />
      ),
    },

    // Tooltip area 2  
    {
      top: "30.8%",
      left: "94.8%",
      content: (
        <div 
          title="Расходомер 2"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
        />
      ),
    },

    // Tooltip area 3
    {
      top: "30.8%",
      left: "97.8%", 
      content: (
        <div 
          title="Расходомер 3"
          style={{
            position: "absolute",
            top: "0%",
            left: "0%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
        />
      ),
    },
  ];

  // Array for ProgressBars with percentage positions
  const progressBarData = [
    {
      top: "53%",
      left: "54.75%",
      key: "rvs-1",
      primaryValue: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS1_LT")?.value || 0),
      secondaryValue: Math.round(oilProgressData.find(d => d.tag_key === "rvs_1_volume")?.value || 0),
      maxValue: 1020,
      color: "#8d730e",
      width: 12,
      height: 90,
      label: "RVS-1",
      labelTop: "12%",
      labelLeft: "60.3%",
    },
    {
      top: "73.4%",
      left: "54.75%",
      key: "rvs-2",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS2_LT")?.value || 0),
      secondaryValue: Math.round(oilProgressData.find(d => d.tag_key === "rvs_2_volume")?.value || 0),
      maxValue: 1020,
      color: "#8d730e",
      width: 12,
      height: 90,
      label: "RVS-2",
      labelTop: "7%",
      labelLeft: "89%",
    },
    {
      top: "53%",
      left: "67.3%",
      key: "rvs-3",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS7_LT")?.value || 0),
      secondaryValue: Math.round(oilProgressData.find(d => d.tag_key === "rvs_3_volume")?.value || 0),
      maxValue: 1020,
      color: "#8d730e",
      width: 12,
      height: 90,
      label: "RVS-3",
      labelTop: "17%",
      labelLeft: "107%",
    },
    {
      top: "73.4%",
      left: "67.3%",
      key: "rvs-4",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS8_LT")?.value || 0),
      secondaryValue: Math.round(oilProgressData.find(d => d.tag_key === "rvs_4_volume")?.value || 0),
      maxValue: 1020,
      color: "#8d730e",
      width: 12,
      height: 90,
      label: "RVS-4",
      labelTop: "7%",
      labelLeft: "107%",
    },

    // Additional 4 progress bars with blue color
    {
      // 2
      top: "49.2%",
      left: "80.5%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS6_LT")?.value || 0),
      maxValue: 510,
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
      left: "89.2%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS5_LT")?.value || 0),
      maxValue: 510,
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
      left: "89.2%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS3_LT")?.value || 0),
      maxValue: 510,
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
      left: "80.5%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS4_LT")?.value || 0),
      maxValue: 510,
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
                primaryValue={progressBar.primaryValue}
                secondaryValue={progressBar.secondaryValue}
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
                      domain={[0, 100]}
                      ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                      label={{ 
                        value: 'Обводненность (%)', 
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
                      name="Обводненность"
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
                  Последние 24 измерений • 
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
