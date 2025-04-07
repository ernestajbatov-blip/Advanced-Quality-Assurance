import React from "react";
import SchemeMain from "../../data/Diagrams/SchemeMain.svg";
import styles from "./Diagram.module.css";
import Indicator from "../Indicator/Indicator";
import LabelBox from "../LabelBox/LabelBox";
import ProgressBar from "../ProgressBar/ProgressBar";
import Pumps from "../Pumps/Pumps";
import Table from "../Table/Table";
import SimpleTable from "../SimpleTable/SimpleTable";
import AppNav from "../AppNav/AppNav";
import { NavLink } from "react-router-dom";

export default function Diagram() {
  const tableData = [
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
              label={"Узел отчета"}
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
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", transform: "scale(1)", transformOrigin: "bottom left", fontSize: "12px" }}>
            <div style={{ flex: 0.5, width: "100%" }}>
              <SimpleTable data={tableData.slice(0, 2)} />
            </div>
            <div style={{ flex: 0.5, width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <SimpleTable data={tableData.slice(2, 4)} />
            </div>
          </div>

          <LabelBox label={"Печь"} width={210} height={10} fontSize={12} />
        </>

      )
    },
    {
      top: "14.6%",
      left: "40.3%",
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
  ];

  // Array for ProgressBars with percentage positions
  const progressBarData = [
    {
      top: "25.5%",
      left: "60.45%",
      key: "pbc1L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "Progress 1",
      labelTop: "12%", // Positioning the label above the bar
      labelLeft: "60.3%",
    },
    {
      top: "5.2%",
      left: "60.45%",
      key: "pbc2L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "Progress 2",
      labelTop: "7%",
      labelLeft: "89%",
    },
    {
      top: "25.4%",
      left: "72.99%",
      key: "pbc3L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "Progress 3",
      labelTop: "17%",
      labelLeft: "107%",
    },
    {
      top: "5.1%",
      left: "72.99%",
      key: "pbc4L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 11,
      height: 90,
      label: "Progress 4",
      labelTop: "7%",
      labelLeft: "107%",
    },

    // Additional 4 progress bars with blue color
    {
      top: "49.2%",
      left: "86.8%",
      key: "pbc5L",
      value: 75,
      maxValue: 100,
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
      value: 75,
      maxValue: 100,
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
      value: 75,
      maxValue: 100,
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
      value: 75,
      maxValue: 100,
      color: "#0C5D81", // Blue color
      width: 9,
      height: 68,
      label: "Progress 8",
      labelTop: "27%",
      labelLeft: "60%",
    },
  ];

  return (

    
    <div className={styles.navWrapper}>
      <AppNav />

      <div className={styles.container}>
        
        
        <img src={SchemeMain} alt="Diagram"  className={styles.svg} />
        

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
      
    </div>

    
  );
}
