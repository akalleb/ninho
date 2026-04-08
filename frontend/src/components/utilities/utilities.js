/* eslint-disable no-underscore-dangle */
const textRefactor = (text, size) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  const words = text.split(' ');
  if (!size || size <= 0 || words.length <= size) {
    return text;
  }
  return `${words.slice(0, size).join(' ')}...`;
};

const chartLinearGradient = (canvas, height, color) => {
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color.start}`);
  gradient.addColorStop(1, `${color.end}`);
  return gradient;
};

// Chart.js v4 External Custom Tooltip Function
const customTooltips = (context) => {
  const { chart, tooltip } = context;
  
  // Hide any default Chart.js tooltip elements aggressively
  const defaultTooltips = document.querySelectorAll(`
    .chartjs-tooltip,
    .chartjs-tooltip-key,
    .chartjs-tooltip-body,
    .chartjs-tooltip-title,
    .chartjs-tooltip-header,
    .chartjs-tooltip-footer,
    .chartjs-tooltip-label,
    .chartjs-tooltip-value,
    .chartjs-tooltip-caret,
    .chartjs-tooltip-arrow,
    div[class*="chartjs-tooltip"],
    div[class*="chart-tooltip"],
    div[class*="tooltip"]:not(.chartjs-custom-tooltip)
  `);
  defaultTooltips.forEach(el => {
    el.style.display = 'none';
    el.style.opacity = '0';
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
  });
  
  // Create tooltip element if it doesn't exist
  let tooltipEl = document.querySelector('.chartjs-custom-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'chartjs-custom-tooltip';
    tooltipEl.style.cssText = `
      opacity: 0;
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      font-family: 'Jost', sans-serif;
      pointer-events: none;
      z-index: 1000;
      transition: opacity 0.3s ease;
      min-width: 120px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    document.body.appendChild(tooltipEl);
  }

  // Hide tooltip if opacity is 0 or no active elements
  if (tooltip.opacity === 0 || !tooltip.dataPoints || tooltip.dataPoints.length === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Get active data points
  const activePoints = tooltip.dataPoints;
  const label = chart.data.labels[activePoints[0].dataIndex];
  
  // Clear previous content safely
  tooltipEl.textContent = '';
  
  // Create label element using DOM methods (safe from XSS)
  const labelEl = document.createElement('div');
  labelEl.style.cssText = 'font-weight: 600; margin-bottom: 8px; color: #ffffff; font-size: 14px;';
  labelEl.textContent = label; // Use textContent instead of innerHTML
  tooltipEl.appendChild(labelEl);
  
  // Create data point elements using DOM methods (safe from XSS)
  activePoints.forEach((dataPoint) => {
    const dataset = chart.data.datasets[dataPoint.datasetIndex];
    const value = dataPoint.parsed.y || dataPoint.parsed;
    const datasetLabel = dataset.label || `Dataset ${dataPoint.datasetIndex + 1}`;
    const color = dataset.backgroundColor || dataset.borderColor || '#ffffff';
    
    const pointContainer = document.createElement('div');
    pointContainer.style.cssText = 'display: flex; align-items: center; margin-bottom: 4px;';
    
    // Color indicator dot
    const colorDot = document.createElement('span');
    colorDot.style.cssText = `display: inline-block; width: 12px; height: 12px; background: ${color}; border-radius: 50%; margin-right: 8px; border: 1px solid rgba(255, 255, 255, 0.3);`;
    pointContainer.appendChild(colorDot);
    
    // Label and value text (safely escaped)
    const textEl = document.createElement('span');
    textEl.style.cssText = 'color: #ffffff; font-size: 12px;';
    const strongEl = document.createElement('strong');
    strongEl.textContent = value; // Use textContent for safety
    textEl.textContent = `${datasetLabel}: `;
    textEl.appendChild(strongEl);
    pointContainer.appendChild(textEl);
    
    tooltipEl.appendChild(pointContainer);
  });

  // Position tooltip
  const { canvas } = chart;
  const canvasRect = canvas.getBoundingClientRect();
  
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = `${canvasRect.left + tooltip.caretX - 60}px`;
  tooltipEl.style.top = `${canvasRect.top + tooltip.caretY - 80}px`;
};

// Modern Chart.js v4 tooltip configuration
export const getCustomTooltipConfig = () => ({
  enabled: true,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  titleColor: '#ffffff',
  bodyColor: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderWidth: 1,
  cornerRadius: 8,
  displayColors: true,
  usePointStyle: true,
  intersect: false,
  mode: 'index',
  position: 'nearest',
  animation: {
    duration: 200,
  },
  titleFont: {
    family: "'Jost', sans-serif",
    size: 14,
    weight: 600,
  },
  bodyFont: {
    family: "'Jost', sans-serif",
    size: 12,
    weight: 400,
  },
  padding: {
    top: 12,
    right: 16,
    bottom: 12,
    left: 16,
  },
  caretSize: 6,
  caretPadding: 6,
  multiKeyBackground: 'rgba(255, 255, 255, 0.1)',
  callbacks: {
    title(context) {
      return context[0].label;
    },
    label(context) {
      const { dataset } = context;
      const label = dataset.label || `Data Point ${context.datasetIndex + 1}`;
      const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
      return `${label}: ${value}`;
    },
    labelColor(context) {
      const { dataset } = context;
      const color = dataset.borderColor || dataset.backgroundColor || dataset.pointBackgroundColor || '#ffffff';
      return {
        borderColor: color,
        backgroundColor: color,
      };
    },
    labelTextColor() {
      return '#ffffff';
    },
    afterBody() {
      setTimeout(() => {
        const tooltipKeys = document.querySelectorAll('.chartjs-tooltip-key');
        tooltipKeys.forEach(key => {
          key.style.marginRight = '14px';
        });
        
        // Force z-index on tooltip
        const tooltips = document.querySelectorAll('.chartjs-tooltip');
        tooltips.forEach(tooltip => {
          tooltip.style.zIndex = '99999';
          tooltip.style.position = 'fixed';
        });
      }, 0);
      return '';
    },
  },
});

export { textRefactor, chartLinearGradient, customTooltips };
