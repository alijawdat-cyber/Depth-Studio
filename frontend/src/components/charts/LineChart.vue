<template>
  <div class="line-chart-container">
    <canvas
      ref="chartRef"
      :width="width"
      :height="height"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
  type ChartData
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ======================================
// Props
// ======================================
interface Props {
  data: ChartData<'line'>
  width?: number
  height?: number
  options?: any
  title?: string
  responsive?: boolean
  maintainAspectRatio?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  responsive: true,
  maintainAspectRatio: false
})

// ======================================
// State
// ======================================
const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart<'line'> | null = null

// ======================================
// Default Options
// ======================================
const defaultOptions = {
  responsive: props.responsive,
  maintainAspectRatio: props.maintainAspectRatio,
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold'
      },
      color: 'rgb(55, 65, 81)' // text-gray-700
    },
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        title: function(context: any) {
          return context[0].label
        },
        label: function(context: any) {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)', // text-gray-500
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        color: 'rgb(107, 114, 128)', // text-gray-500
        font: {
          size: 11
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const
  },
  elements: {
    line: {
      tension: 0.3, // Smooth curves
      borderWidth: 2
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
      hoverBorderWidth: 3
    }
  }
}

// ======================================
// Methods
// ======================================

/**
 * Create the chart instance
 */
function createChart() {
  if (!chartRef.value) return

  // Merge custom options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...props.options
  }

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: props.data,
    options: mergedOptions
  }

  chartInstance = new Chart(chartRef.value, config)
}

/**
 * Update chart data
 */
function updateChart() {
  if (!chartInstance) return
  
  chartInstance.data = props.data
  chartInstance.update('active')
}

/**
 * Destroy chart instance
 */
function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

/**
 * Resize chart
 */
function resizeChart() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// ======================================
// Lifecycle
// ======================================
onMounted(async () => {
  await nextTick()
  createChart()
})

onBeforeUnmount(() => {
  destroyChart()
})

// ======================================
// Watchers
// ======================================
watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

watch(
  () => props.options,
  () => {
    destroyChart()
    nextTick(() => {
      createChart()
    })
  },
  { deep: true }
)

// ======================================
// Expose methods
// ======================================
defineExpose({
  chart: chartInstance,
  updateChart,
  resizeChart,
  destroyChart
})
</script>

<style scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.line-chart-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style> 