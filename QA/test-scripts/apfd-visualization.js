/**
 * APFD Visualization Module
 * Generates curves and charts for fault detection analysis
 */

/**
 * Generate CSV data for cumulative fault detection curve
 */
function generateCurveCSV(curve, orderingName) {
  let csv = 'TestPosition,FaultsDetected,FaultsRemaining,PercentageDetected\n';
  for (const point of curve) {
    csv += `${point.testPosition},${point.faultsDetected},${point.faultsRemaining},${point.percentageDetected.toFixed(2)}\n`;
  }
  return csv;
}

/**
 * Generate HTML chart using Chart.js CDN
 */
function generateHTMLChart(riskBasedAnalyses, randomAnalyses) {
  const riskCurves = riskBasedAnalyses.map(a => a.curve);
  const randomCurves = randomAnalyses.map(a => a.curve);

  // Average curves
  const avgRiskCurve = averageCurves(riskCurves);
  const avgRandomCurves = averageCurves(randomCurves);

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APFD Cumulative Fault Detection Curves</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 30px;
    }
    h2 {
      color: #555;
      margin-top: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }
    .chart-wrapper {
      background: #fafafa;
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .chart-wrapper h3 {
      margin-top: 0;
      color: #333;
      font-size: 16px;
    }
    canvas {
      max-width: 100%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #007bff;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
    .metric {
      display: inline-block;
      background: #e7f3ff;
      padding: 10px 15px;
      margin: 5px;
      border-radius: 4px;
      font-weight: 500;
      color: #0056b3;
    }
    .winner {
      background: #d4edda;
      color: #155724;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔬 APFD - Cumulative Fault Detection Analysis</h1>
    
    <div class="charts-row">
      <div class="chart-wrapper">
        <h3>Risk-Based vs Random (Average)</h3>
        <canvas id="comparisonChart"></canvas>
      </div>
      <div class="chart-wrapper">
        <h3>Risk-Based by Browser</h3>
        <canvas id="browserChart"></canvas>
      </div>
    </div>

    <h2>📊 Cumulative Fault Detection Curves</h2>
    <p>Shows percentage of faults detected as test execution progresses</p>
    <div class="charts-row">
      <div class="chart-wrapper">
        <h3>Risk-Based Ordering</h3>
        <canvas id="riskChart"></canvas>
      </div>
      <div class="chart-wrapper">
        <h3>Random Ordering (Average)</h3>
        <canvas id="randomChart"></canvas>
      </div>
    </div>

    <h2>📈 Performance Metrics</h2>
    <h3>Risk-Based vs Random</h3>
    <div>
      <span class="metric">Risk-Based APFD: <strong>${(riskBasedAnalyses[0].apfd).toFixed(4)}</strong></span>
      <span class="metric">Random APFD: <strong>${(randomAnalyses[0].apfd).toFixed(4)}</strong></span>
      <span class="metric winner">Improvement: <strong>${(((riskBasedAnalyses[0].apfd - randomAnalyses[0].apfd) / randomAnalyses[0].apfd * 100).toFixed(2))}%</strong></span>
    </div>

    <h2>📋 Results Table</h2>
    <table>
      <thead>
        <tr>
          <th>Strategy</th>
          <th>Browser</th>
          <th>APFD Score</th>
          <th>T1F Position</th>
          <th>Faults Detected</th>
        </tr>
      </thead>
      <tbody>
${riskBasedAnalyses.map(a => `
        <tr>
          <td>Risk-Based</td>
          <td>${a.browser}</td>
          <td>${a.apfd.toFixed(4)}</td>
          <td>${a.t1f.position || 'N/A'}</td>
          <td>${a.detectedFaults} / ${a.m}</td>
        </tr>
`).join('')}
      </tbody>
    </table>
  </div>

  <script>
    // Comparison Chart
    new Chart(document.getElementById('comparisonChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(avgRiskCurve.map(p => p.testPosition))},
        datasets: [
          {
            label: 'Risk-Based (TCP)',
            data: ${JSON.stringify(avgRiskCurve.map(p => p.percentageDetected))},
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Random (Baseline)',
            data: ${JSON.stringify(avgRandomCurves.map(p => p.percentageDetected))},
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Faults Detected (%)' },
          },
          x: {
            title: { display: true, text: 'Test Position' },
          },
        },
      },
    });

    // Browser Comparison
    new Chart(document.getElementById('browserChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(riskBasedAnalyses.map(a => a.browser))},
        datasets: [
          {
            label: 'APFD Score',
            data: ${JSON.stringify(riskBasedAnalyses.map(a => a.apfd))},
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#dc3545'
            ],
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: { beginAtZero: true, max: 1 },
        },
      },
    });

    // Risk-Based Curve
    new Chart(document.getElementById('riskChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(avgRiskCurve.map(p => p.testPosition))},
        datasets: [
          {
            label: 'Faults Detected (%)',
            data: ${JSON.stringify(avgRiskCurve.map(p => p.percentageDetected))},
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#28a745',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });

    // Random Curve
    new Chart(document.getElementById('randomChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(avgRandomCurves.map(p => p.testPosition))},
        datasets: [
          {
            label: 'Faults Detected (%)',
            data: ${JSON.stringify(avgRandomCurves.map(p => p.percentageDetected))},
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#dc3545',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });
  </script>
</body>
</html>
  `;
  return html;
}

/**
 * Average multiple curves
 */
function averageCurves(curves) {
  if (curves.length === 0) return [];
  
  const maxLen = Math.max(...curves.map(c => c.length));
  const averaged = [];

  for (let i = 0; i < maxLen; i++) {
    const points = curves
      .filter(c => c[i])
      .map(c => c[i]);
    
    if (points.length === 0) continue;

    const avgPoint = {
      testPosition: points[0].testPosition,
      faultsDetected: points.reduce((s, p) => s + p.faultsDetected, 0) / points.length,
      faultsRemaining: points.reduce((s, p) => s + p.faultsRemaining, 0) / points.length,
      percentageDetected: points.reduce((s, p) => s + p.percentageDetected, 0) / points.length,
    };
    averaged.push(avgPoint);
  }

  return averaged;
}

/**
 * Generate Markdown table for curves
 */
function generateCurveTable(curves, title) {
  let md = `## ${title}\n\n`;
  md += `| Test Position | Faults Detected | Faults Remaining | % Detected |\n`;
  md += `|---------------|-----------------|------------------|------------|\n`;
  
  for (const point of curves) {
    md += `| ${point.testPosition} | ${Math.round(point.faultsDetected)} | ${Math.round(point.faultsRemaining)} | ${point.percentageDetected.toFixed(2)}% |\n`;
  }

  return md;
}

export {
  generateCurveCSV,
  generateHTMLChart,
  generateCurveTable,
  averageCurves,
};
