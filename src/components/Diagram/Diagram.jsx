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
    { top: "6%", left: "11.3%", content: "КУУГ" },
    {
      top: "20%",
      left: "22%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={30} height={3} fontSize={5} />
        </>
      ),
    },
    {
      top: "20%",
      left: "14%",
      content: (
        <>
          <Indicator indicatorNumber={0.0} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={30} height={3} fontSize={5} />
        </>
      ),
    },
    { top: "27%", left: "11.3%", content: "ЦППГ" },
    {
      top: "5%",
      left: "85%",
      content: (
        <>
          <LabelBox
            label={"Узел отчета"}
            width={130}
            height={5}
            fontSize={10}
          />
          <Table data={data} />
        </>
      ),
    },
    {
      top: "66%",
      left: "55.3%",
      content: (
        <>
          <SimpleTable data={tableData} />
          <LabelBox label={"Печь"} width={103} height={5} fontSize={10} />
        </>
      ),
    },
    {
      top: "14%",
      left: "40.3%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={60} height={50} />
          <LabelBox
            label={"Насосная циркуляция нефти"}
            width={101}
            height={10}
            fontSize={7}
          />
        </>
      ),
    },
    {
      top: "83%",
      left: "83.5%",
      content: (
        <>
          <Pumps numberOfSquares={4} activeIndex={0} width={30} height={30} />
          <LabelBox
            label={"Насосная пожаротушения"}
            width={105}
            height={10}
            fontSize={7}
          />
        </>
      ),
    },
    {
      top: "64%",
      left: "38.2%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={60} height={50} />
          <LabelBox
            label={"Насосная перекачка нефти"}
            width={101}
            height={10}
            fontSize={7}
          />
        </>
      ),
    },
    {
      top: "45%",
      left: "73.5%",
      content: (
        <>
          <Pumps numberOfSquares={2} activeIndex={0} width={60} height={50} />
          <LabelBox
            label={"Насосная циркуляция воды"}
            width={101}
            height={10}
            fontSize={7}
          />
        </>
      ),
    },
    {
      top: "26%", // Label for PBC-1
      left: "57.5%",
      content: "PBC-1",
      color: "#000",
      size: "11px",
    },
    {
      top: "34%", // Label for PBC-1
      left: "57.2%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "6%", // Label for PBC-2
      left: "57.5%",
      content: "PBC-2",
      color: "#000",
      size: "11px",
    },
    {
      top: "13%", // Label for PBC-2
      left: "57.2%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "26%", // Label for PBC-3
      left: "70%",
      content: "PBC-3",
      color: "#000",
      size: "11px",
    },
    {
      top: "34%", // Label for PBC-3
      left: "69.8%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "13%", // Label for PBC-4
      left: "69.7%",
      content: "V 1000м³",
      color: "#000",
      size: "10px",
    },
    {
      top: "6%", // Label for PBC-4
      left: "70%",
      content: "PBC-4",
      color: "#000",
      size: "11px",
    },

    // Вода
    {
      top: "69%", // Label for PBC-1
      left: "84.3%",
      content: "PBC-1",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-1
      left: "84.3%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "50%", // Label for PBC-2
      left: "84.3%",
      content: "PBC-2",
      color: "#000",
      size: "10px",
    },
    {
      top: "54%", // Label for PBC-2
      left: "84.3%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
    {
      top: "69%", // Label for PBC-3
      left: "93%",
      content: "PBC-3",
      color: "#000",
      size: "10px",
    },
    {
      top: "75%", // Label for PBC-3
      left: "93%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },

    {
      top: "50%", // Label for PBC-4
      left: "93%",
      content: "PBC-4",
      color: "#000",
      size: "10px",
    },
    {
      top: "54%", // Label for PBC-4
      left: "93%",
      content: "V 500м³",
      color: "#000",
      size: "8px",
    },
  ];

  // Array for ProgressBars with percentage positions
  const progressBarData = [
    {
      top: "24.7%",
      left: "60.3%",
      key: "pbc1L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 9,
      height: 64,
      label: "Progress 1",
      labelTop: "12%", // Positioning the label above the bar
      labelLeft: "60.3%",
    },
    {
      top: "4.8%",
      left: "60.3%",
      key: "pbc2L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 9,
      height: 64,
      label: "Progress 2",
      labelTop: "7%",
      labelLeft: "89%",
    },
    {
      top: "24.7%",
      left: "72.8%",
      key: "pbc3L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 9,
      height: 64,
      label: "Progress 3",
      labelTop: "17%",
      labelLeft: "107%",
    },
    {
      top: "4.8%",
      left: "72.8%",
      key: "pbc4L",
      value: 50,
      maxValue: 100,
      color: "#8d730e",
      width: 9,
      height: 64,
      label: "Progress 4",
      labelTop: "7%",
      labelLeft: "107%",
    },

    // Additional 4 progress bars with blue color
    {
      top: "48%",
      left: "86.6%",
      key: "pbc5L",
      value: 75,
      maxValue: 100,
      color: "#0C5D81", // Blue color
      width: 7,
      height: 50,
      label: "Progress 5",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "48%",
      left: "95.3%",
      key: "pbc5L",
      value: 75,
      maxValue: 100,
      color: "#0C5D81", // Blue color
      width: 7,
      height: 50,
      label: "Progress 6",
      labelTop: "27%",
      labelLeft: "60%",
    },

    {
      top: "67.9%",
      left: "95.3%",
      key: "pbc5L",
      value: 75,
      maxValue: 100,
      color: "#0C5D81", // Blue color
      width: 7,
      height: 50,
      label: "Progress 7",
      labelTop: "27%",
      labelLeft: "60%",
    },
    {
      top: "67.9%",
      left: "86.6%",
      key: "pbc5L",
      value: 75,
      maxValue: 100,
      color: "#0C5D81", // Blue color
      width: 7,
      height: 50,
      label: "Progress 8",
      labelTop: "27%",
      labelLeft: "60%",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <AppNav/>

      <div className={styles.container}>
        {/* <div className={styles.navWrapper}>
          <AppNav />
        </div> */}

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
          style={{ top: "78%", left: "69%" }}
        >
          <Indicator indicatorNumber={69.3} indicatorUnits={"т/ч"} />
          <Indicator indicatorNumber={86.8} indicatorUnits={"м3/ч"} />
          <LabelBox label={"Расходомер"} width={30} height={3} fontSize={5} />
        </div>
      </div>
    </div>
  );
}
