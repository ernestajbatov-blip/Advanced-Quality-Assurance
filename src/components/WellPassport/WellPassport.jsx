import React from "react";
import styles from "./WellPassport.module.css";

export default function WellPassport({well}) {
    const wellName = well["Скважина"];

    const wellData = Object.entries(well[0]);
    console.log(well)

    return (
        <div className={styles.tableContainer}>
            <h2>Карточка скважины</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Карточка скважины</th>
                        <th>Данные</th>
                    </tr>
                </thead>
                <tbody>
                    {wellData.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry[0]}</td>
                            <td>{entry[1]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}