import React from "react";
import { useEffect, useState } from "react";
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

export default function Diagram() {
  const [oilProgressData, setOilProgressData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState("Sensor Data");

  useEffect(() => {
    axios.get("http://localhost:3000/api/progress-oil")
      .then(res => {
        setOilProgressData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch oil progress data", err);
      });
  }, []);

  const TAG_UNITS = {
    // tfs-1
    "ARM_LSA2_TFS": "см",
    "ARM_PT1_TFS": "атм",
    "ARM_TFS_LC1_H2O": "см",
    "ARM_TFS_LC1_L": "см",
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
    "ARM_ZN_EP3_LT": "cм"    
  };

  // New mapping for tag descriptions
  const TAG_DESCRIPTIONS = {
    // tfs-1
    "ARM_LSA2_TFS": "Уровень",
    "ARM_PT1_TFS": "Давление",
    "ARM_TFS_LC1_H2O": "Уровень",
    "ARM_TFS_LC1_L": "Уровень",
    "ARM_TT1_TFS": "Температура",

    // tfs-2
    "ARM_PT1_TFS2": "Давление",
    "ARM_TT1_TFS2": "Температура",
    "ARM_LC_I_TFS2": "Уровень",
    "ARM_LC_L_TFS2": "Уровень",
    "ARM_LSA2_TFS2": "Уровень",

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
    "ARM_ZN_EP3_LT": "Уровень"    
  };

  const handleTableClick = (filterTags = null, buttonTitle = "Sensor Data") => {
    let transformedData;
    
    if (filterTags && filterTags.length > 0) {
      // Filter data based on specific tag keys and use descriptions
      transformedData = oilProgressData
        .filter(item => filterTags.includes(item.tag_key))
        .map(item => ({
          "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
          "Показание": `${Math.round(item.value * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
        }));
    } else {
      // Show all data if no filter specified
      transformedData = oilProgressData.map(item => ({
        "Датчик": TAG_DESCRIPTIONS[item.tag_key] || item.tag_key,
        "Показание": `${Math.round((item.tag_value || item.value) * 100) / 100} ${TAG_UNITS[item.tag_key] || ''}`.trim()
      }));
    }
    
    setTableData(transformedData);
    setTableTitle(buttonTitle);
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

  const data = [
    { value: "73.03", unit: "т/ч" },
    { value: "90.50", unit: "м³/ч" },
    { value: "15.51", unit: "°C" },
    { value: "0", unit: "м³" },
    { value: "635 665", unit: "т" },
    { value: "73.13", unit: "%" },
  ];

  // Array of objects for dynamically creating LabelBox + Table/Indicator/Pumps components with percentage positions
  const componentData = [
    { top: "6.5%", left: "10.5%", content: "КУУГ" },
    {
      top: "16.2%",
      left: "22%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"}/>
          <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
        </>
      ),
    },
    {
      top: "16.2%",
      left: "13%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={60} height={5} fontSize={10} />
        </>
      ),
    },
    { top: "28%", left: "10.5%", content: "ЦППГ" },
    {
      top: "5.6%",
      left: "85.5%",
      content: (
        <>
          <LabelBox
              label={"Узел учета"}
              width={175}
              height={18}
              fontSize={10}
            />
            <div style={{transform: "scale(1.3)", transformOrigin: "top left"}}>
              <Table data={data} />
            </div>                      
        </>
      ),
    },
    {
      top: "68.7%",
      left: "54%",
      content: (
        <>
            <div style={{ flex: 0.5, width: "100%", fontSize: "11px" }}>
              <SimpleTable data={tableDataStatic.slice(0, 2)} />
            </div>
      

          <LabelBox label={"Печь"} width={205} height={10} fontSize={12} />
        </>

      )
    },
    {
      top: "68.7%",
      left: "59.5%",
      content: (
        <>
  
            <div style={{ flex: 0.5, width: "100%", display: "flex", justifyContent: "flex-end", fontSize: "11px" }}>
              <SimpleTable data={tableDataStatic.slice(2, 4)} />
            </div>
         

          
        </>

      )
    },
    {
      top: "14.6%",
      left: "30.9%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={85} height={50} />
          <LabelBox
            label={"Насосная циркуляция нефти"}
            width={150}
            height={10}
            fontSize={10}
          />
        </>
      ),
    },
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
      top: "69%",
      left: "35.05%",
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
      top: "47%",
      left: "73.5%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={85} height={50} />
          <LabelBox
            label={"Насосная циркуляция воды"}
            width={150}
            height={10}
            fontSize={10}
          />
        </>
      ),
    },
    {
      top: "26%", // Label for PBC-1
      left: "58%",
      content: "PBC-1",
      color: "#000",
      size: "11px",
    },
    {
      top: "34%", // Label for PBC-1
      left: "58%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "6%", // Label for PBC-2
      left: "58%",
      content: "PBC-2",
      color: "#000",
      size: "11px",
    },
    {
      top: "13%", // Label for PBC-2
      left: "58%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "8%",
      left: "64.95%",
      content: (
        <>
          <LabelBox label={""} width={32} height={25} fontSize={10} />
        </>
      ),
    },
    {
      top: "26%", // Label for PBC-3
      left: "70.5%",
      content: "PBC-3",
      color: "#000",
      size: "11px",
    },
    {
      top: "34%", // Label for PBC-3
      left: "70.5%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "13%", // Label for PBC-4
      left: "70.5%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "6%", // Label for PBC-4
      left: "70.5%",
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
      top: "70.2%", // Label for PBC-3
      left: "93.5%",
      content: "PBC-3",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-3
      left: "93.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "50%", // Label for PBC-4
      left: "93.5%",
      content: "PBC-4",
      color: "#000",
      size: "10px",
    },
    {
      top: "54.8%", // Label for PBC-4
      left: "93.5%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
    //Tables
    {
      top: "80%",
      left: "28.48%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_LSA2_TFS", "ARM_PT1_TFS", "ARM_TFS_LC1_H2O", "ARM_TFS_LC1_L", "ARM_TT1_TFS"], 
            "ТФС-1"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "40px",
            height: "20px",
            cursor: "pointer"
          }}
        />

      ),
    },
    {
      top: "65%",
      left: "28.48%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_PT1_TFS2", "ARM_TT1_TFS2", "ARM_LC_I_TFS2", "ARM_LC_L_TFS2", "ARM_LSA2_TFS2"], 
            "ТФС-2"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "40px",
            height: "20px",
            cursor: "pointer"
          }}
        />

      ),
    },
    {
      top: "53%",
      left: "50.2%",
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
            // backgroundColor: "black"
          }}
        />

      ),
    },
    {
      top: "53%",
      left: "59.75%",
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
            // backgroundColor: "black"
          }}
        />

      ),
    },
    {
      top: "70%",
      left: "30.9%",
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
            // backgroundColor: "black"
          }}
        />

      ),
    },
    {
      top: "60%",
      left: "67.4%",
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
            // backgroundColor: "black"
          }}
        />

      ),
    },
    {
      top: "60%",
      left: "71.6%",
      content: (
        <div 
          onClick={() => handleTableClick(
            ["ARM_ZN_BPV_LS", "ARM_ZN_BPV_LS_H2O", "ARM_ZN_BPV_PT", "ARM_ZN_BPV_TT"], 
            "БПВ"
          )}
          style={{
            position: "absolute",
            top: "80%",
            left: "28.48%",
            width: "38px",
            height: "105px",
            cursor: "pointer",
            // backgroundColor: "black"
          }}
        />

      ),
    },
  ];

  // Array for ProgressBars with percentage positions
  const progressBarData = [
    {
      top: "25.5%",
      left: "60.4%",
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
      top: "5.2%",
      left: "60.4%",
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
      top: "25.4%",
      left: "72.99%",
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
      top: "5.1%",
      left: "72.99%",
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
      top: "49.2%",
      left: "86.8%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS4_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 5",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "49.2%",
      left: "95.4%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS6_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 6",
      labelTop: "27%",
      labelLeft: "60%",
    },

    {
      top: "69.3%",
      left: "95.4%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS5_LT")?.value || 0),
      maxValue: 500,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 7",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "69.3%",
      left: "86.8%",
      key: "pbc5L",
      value: Math.round(oilProgressData.find(d => d.tag_key === "ARM_ZN_RVS3_LT")?.value || 0),
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
      top: "17.8%",
      left: "43.3%",
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
      top: "17.8%",
      left: "48.5%",
      key: "ep3",
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
      top: "17.8%",
      left: "53.7%",
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

        <div
          className={`${styles.box} ${styles.textBox}`}
          style={{ top: "78%", left: "68.655%" }}
        >
          <Indicator indicatorNumber={69.3} indicatorUnits={"т/ч"} />
          <Indicator indicatorNumber={86.8} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={60} height={3} fontSize={10} />
        </div>
        <div
          className={`${styles.box} ${styles.textBox}`}
          style={{ top: "69%", left: "12%" }}
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
    </div>
  );
}