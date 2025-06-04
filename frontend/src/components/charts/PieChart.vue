<template>
  <div class="pie-chart-container">
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
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
  type ChartData
} from 'chart.js'

// Register Chart.js components
Chart.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// ======================================
// Props
// ======================================
interface Props {
  data: ChartData<'pie'>
  width?: number
  height?: number
  options?: any
  title?: string
  responsive?: boolean
  maintainAspectRatio?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 400,
  responsive: true,
  maintainAspectRatio: false
})

// ======================================
// State
// ======================================
const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart<'pie'> | null = null

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
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        },
        generateLabels: function(chart: any) {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label: string, i: number) => {
              const dataset = data.datasets[0]
              const backgroundColor = Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[i] 
                : dataset.backgroundColor
              const value = dataset.data[i]
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0)
              const percentage = Math.round((value / total) * 100)
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: backgroundColor,
                hidden: false,
                index: i
              }
            })
          }
          return []
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
          return context[0].label || ''
        },
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = Math.round((value / total) * 100)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const,
    animateRotate: true,
    animateScale: true
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3
    }
  },
  cutout: 0, // 0 for pie, > 0 for doughnut
  radius: '90%'
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

  const config: ChartConfiguration<'pie'> = {
    type: 'pie',
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
.pie-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style> 