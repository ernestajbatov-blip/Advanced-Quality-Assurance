import React, { useState, useEffect, useMemo } from "react";
import {
  fetch2Hours,
  fetch2HoursArchive,
  getAvailableArchiveDates,
} from "../../axios/wellService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import styles from "./Chart.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, isSameDay, format } from "date-fns";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, chartDate }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className={`${styles.tooltipItem} ${
              entry.name === "Дебит за предыдущие сутки"
                ? styles.tooltipGray
                : entry.name === "Дебит по тех.режиму"
                ? styles.tooltipRed
                : styles.tooltipGreen
            }`}
          >
            {`${entry.value.toLocaleString("ru-RU")}`}
          </div>
        ))}
        <div className={styles.tooltipDate}>
          {label} | {chartDate ? format(parseISO(chartDate), "dd.MM.yyyy") : ""}
        </div>
      </div>
    );
  }
  return null;
};

export default function Chart({ type, setType }) {
  const [isNak, setNak] = useState(true);
  const [data, setData] = useState({ liquid: [], oil: [] });
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartDate, setChartDate] = useState(null);

  const formatYAxis = (tickItem) =>
    Math.abs(tickItem) >= 1000 ? `${(tickItem / 1000).toFixed(1)}k` : tickItem;

  const handleReset = () => {
    setIsArchiveMode(false);
    setSelectedDate(null);
    loadCurrentData();
  };

  useEffect(() => {
    getAvailableArchiveDates()
      .then((response) => {
        setAvailableDates(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching available dates:", error);
      });
  }, []);

  const parsedAvailableDates = useMemo(() => {
    return availableDates
      .map((d) => {
        try {
          const parsedDate = parseISO(d.date);
          if (isNaN(parsedDate.getTime())) {
            const [year, month, day] = d.date.split("-");
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          return parsedDate;
        } catch (error) {
          console.warn("Failed to parse date:", d.date, error);
          return null;
        }
      })
      .filter((date) => date !== null && !isNaN(date.getTime()));
  }, [availableDates]);

  const loadCurrentData = () => {
    setLoading(true);
    fetch2Hours()
      .then((response) => {
        processAndSetData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching current data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadArchiveData = (date) => {
    setLoading(true);
    const dateString = format(date, "yyyy-MM-dd");
    fetch2HoursArchive("ABK", dateString)
      .then((response) => {
        processAndSetData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching archive data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const processAndSetData = (fetchedData) => {
    const sortedData = [...fetchedData].sort((a, b) => {
      const timeToMinutes = (t) => {
        const [h, m] = t?.split(":").map(Number);
        return h * 60 + m;
      };
      const offset = (t) => {
        const minutes = timeToMinutes(t);
        return (minutes - 120 + 1440) % 1440;
      };
      return offset(a.time) - offset(b.time);
    });
    const chartDate = sortedData[0]?.date || new Date().toISOString().split("T")[0];

    setChartDate(chartDate);

    const formattedData = sortedData.map((item) => ({
      name: item.time?.slice(0, 5) || "",

      debit_last_day: Math.floor(item?.debit_last_day || 0),
      tech_rezh: Math.floor(item?.tech_rezh || 0),
      curr_debit: Math.floor(item?.current_debit || 0),

      debit_last_day_nak: Math.floor(item?.debit_last_day_nak || 0),
      tech_rezh_nak: Math.floor(item?.tech_rezh_nak || 0),
      curr_debit_nak: Math.floor(item?.current_debit_nak || 0),

      n_debit_last_day: Math.floor(item?.n_debit_last_day || 0),
      n_tech_rezh: Math.floor(item?.n_tech_rezh || 0),
      n_curr_debit: Math.floor(item?.n_current_debit || 0),

      n_debit_last_day_nak: Math.floor(item?.n_debit_last_day_nak || 0),
      n_tech_rezh_nak: Math.floor(item?.n_tech_rezh_nak || 0),
      n_curr_debit_nak: Math.floor(item?.n_current_debit_nak || 0),
    }));

    const liquidData = formattedData.map((item) => ({
      name: item.name,
      debit_last_day: item.debit_last_day,
      tech_rezh: item.tech_rezh,
      curr_debit: item.curr_debit,
      debit_last_day_nak: item.debit_last_day_nak,
      tech_rezh_nak: item.tech_rezh_nak,
      curr_debit_nak: item.curr_debit_nak,
    }));

    const oilData = formattedData.map((item) => ({
      name: item.name,
      debit_last_day: item.n_debit_last_day,
      tech_rezh: item.n_tech_rezh,
      curr_debit: item.n_curr_debit,
      debit_last_day_nak: item.n_debit_last_day_nak,
      tech_rezh_nak: item.n_tech_rezh_nak,
      curr_debit_nak: item.n_curr_debit_nak,
    }));

    setData({ liquid: liquidData, oil: oilData });
  };

  useEffect(() => {
    loadCurrentData();
  }, []);

  const handleNakChange = (event) => setNak(event.target.checked);
  const handleTypeChange = (event) => setType(event.target.value);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsArchiveMode(true);
      loadArchiveData(date);
    }
  };

  const selectedData = useMemo(() => {
    return isNak
      ? data[type].map((item) => ({ ...item, isNak: true }))
      : data[type];
  }, [data, type, isNak]);

  return (
    <div>
      <div className={styles.controlsContainer}>
        <div className={styles.leftControls}>
          <div className={styles.controlGroup}>
            <input type="checkbox" checked={isNak} onChange={handleNakChange} />
            <label htmlFor="cumulative">Показать с накоплением</label>
          </div>

          <div className={styles.controlGroup}>
            <input
              type="radio"
              id="liquid"
              name="type"
              value="liquid"
              checked={type === "liquid"}
              onChange={handleTypeChange}
            />
            <label htmlFor="liquid">Жидкость</label>
            <span>/</span>
            <input
              type="radio"
              id="oil"
              name="type"
              value="oil"
              checked={type === "oil"}
              onChange={handleTypeChange}
            />
            <label htmlFor="oil">Нефть</label>
          </div>
        </div>

        <div className={styles.rightControls}>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            highlightDates={parsedAvailableDates}
            placeholderText="Выберите дату"
            className={styles.customDatepicker}
          />

          {isArchiveMode && (
            <button onClick={handleReset} className={styles.resetButton}>
              🔄 Текущие данные
            </button>
          )}

          {loading && <span className={styles.loadingText}>⏳ Загрузка...</span>}
        </div>
      </div>

      <LineChart
        width={800}
        height={350}
        data={selectedData}
        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" tick={{ fill: "#ffffff" }} />
        <YAxis tick={{ fill: "#ffffff" }} tickFormatter={formatYAxis} />
        <Tooltip
          content={({ active, payload, label }) => (
            <CustomTooltip
              active={active}
              payload={payload}
              label={label}
              chartDate={chartDate}
            />
          )}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={isNak ? "tech_rezh_nak" : "tech_rezh"}
          name="Дебит по тех.режиму"
          stroke="#B22222"
          strokeDasharray="5 5"
          dot={{ r: 1.5 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey={isNak ? "debit_last_day_nak" : "debit_last_day"}
          name="Дебит за предыдущие сутки"
          stroke="#888888"
          strokeDasharray="3 4 5 2"
          dot={{ r: 1.5 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey={isNak ? "curr_debit_nak" : "curr_debit"}
          name="Прогнозируемый дебит на конец суток"
          stroke="#228B22"
          dot={{ r: 1.5 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </div>
  );
}
