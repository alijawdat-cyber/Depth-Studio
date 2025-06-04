<template>
  <div class="doughnut-chart-container">
    <canvas
      ref="chartRef"
      :width="width"
      :height="height"
    ></canvas>
    <!-- Center Content for Doughnut -->
    <div 
      v-if="centerContent" 
      class="center-content"
      :style="centerContentStyle"
    >
      <div class="center-text">
        <div class="center-title">{{ centerContent.title }}</div>
        <div class="center-value">{{ centerContent.value }}</div>
        <div v-if="centerContent.subtitle" class="center-subtitle">
          {{ centerContent.subtitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
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
// Types
// ======================================
interface CenterContent {
  title: string
  value: string | number
  subtitle?: string
}

// ======================================
// Props
// ======================================
interface Props {
  data: ChartData<'doughnut'>
  width?: number
  height?: number
  options?: any
  title?: string
  responsive?: boolean
  maintainAspectRatio?: boolean
  cutout?: number | string
  centerContent?: CenterContent
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 400,
  responsive: true,
  maintainAspectRatio: false,
  cutout: '50%'
})

// ======================================
// State
// ======================================
const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart<'doughnut'> | null = null

// ======================================
// Computed
// ======================================
const centerContentStyle = computed(() => ({
  width: `${typeof props.cutout === 'string' ? '60%' : `${props.cutout}%`}`,
  height: `${typeof props.cutout === 'string' ? '60%' : `${props.cutout}%`}`
}))

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
  cutout: props.cutout,
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

  const config: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
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
  () => [props.options, props.cutout],
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
.doughnut-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doughnut-chart-container canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.center-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.center-text {
  text-align: center;
  color: rgb(55, 65, 81); /* text-gray-700 */
}

.center-title {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: rgb(107, 114, 128); /* text-gray-500 */
  margin-bottom: 2px;
}

.center-value {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 700; /* font-bold */
  color: rgb(55, 65, 81); /* text-gray-700 */
  line-height: 1.2;
}

.center-subtitle {
  font-size: 0.75rem; /* text-xs */
  color: rgb(107, 114, 128); /* text-gray-500 */
  margin-top: 2px;
}
</style> 