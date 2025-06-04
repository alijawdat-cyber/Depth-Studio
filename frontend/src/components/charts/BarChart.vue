<template>
  <div class="bar-chart-container">
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
  type ChartData
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// ======================================
// Props
// ======================================
interface Props {
  data: ChartData<'bar'>
  width?: number
  height?: number
  options?: any
  title?: string
  responsive?: boolean
  maintainAspectRatio?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  responsive: true,
  maintainAspectRatio: false,
  horizontal: false
})

// ======================================
// State
// ======================================
const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart<'bar'> | null = null

// ======================================
// Default Options
// ======================================
const getDefaultOptions = () => ({
  responsive: props.responsive,
  maintainAspectRatio: props.maintainAspectRatio,
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
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
          const value = context.parsed[props.horizontal ? 'x' : 'y']
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: props.horizontal,
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
      beginAtZero: !props.horizontal,
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
    bar: {
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false
    }
  }
})

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
    ...getDefaultOptions(),
    ...props.options
  }

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
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
  () => [props.options, props.horizontal],
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
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.bar-chart-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style> 