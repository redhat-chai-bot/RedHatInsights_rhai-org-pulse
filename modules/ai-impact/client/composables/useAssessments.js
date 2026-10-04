import { ref, watch } from 'vue'
import { apiRequest } from '@shared/client/services/api.js'
import { useProjectId, projectQuery } from '@shared/client/composables/useProjectId.js'

// Singleton state — fetch once, share refs
const assessments = ref({})
const assessmentMeta = ref({ lastSyncedAt: null, totalAssessed: 0 })
const assessmentLoading = ref(false)
const assessmentError = ref(null)
const detailCache = ref({})
let hasFetched = false

async function loadAssessments() {
  assessmentLoading.value = true
  assessmentError.value = null
  try {
    const data = await apiRequest(`/modules/ai-impact/assessments${projectQuery(useProjectId().value)}`)
    assessments.value = data.assessments || {}
    assessmentMeta.value = {
      lastSyncedAt: data.lastSyncedAt,
      totalAssessed: data.totalAssessed
    }
    // Clear detail cache on project switch so stale details don't leak
    detailCache.value = {}
  } catch (e) {
    assessmentError.value = e.message
  } finally {
    assessmentLoading.value = false
  }
}

async function loadAssessmentDetail(key) {
  const projectId = useProjectId().value
  const cacheKey = projectId ? `${projectId}::${key}` : key
  if (detailCache.value[cacheKey]) {
    return detailCache.value[cacheKey]
  }
  try {
    const requestedProjectId = projectId
    const data = await apiRequest(`/modules/ai-impact/assessments/${encodeURIComponent(key)}${projectQuery(requestedProjectId)}`)
    // Discard if project changed while request was in flight
    if (useProjectId().value !== requestedProjectId) return null
    const storageKey = requestedProjectId ? `${requestedProjectId}::${key}` : key
    detailCache.value[storageKey] = data
    return data
  } catch (e) {
    if (e.message && e.message.includes('404')) {
      return null
    }
    throw e
  }
}

// Re-fetch when project changes
watch(useProjectId(), () => loadAssessments())

export function useAssessments() {
  if (!hasFetched) {
    hasFetched = true
    loadAssessments()
  }
  return {
    assessments,
    assessmentMeta,
    assessmentLoading,
    assessmentError,
    loadAssessments,
    loadAssessmentDetail,
    detailCache
  }
}

export function _resetForTesting() {
  assessments.value = {}
  assessmentMeta.value = { lastSyncedAt: null, totalAssessed: 0 }
  assessmentLoading.value = false
  assessmentError.value = null
  detailCache.value = {}
  hasFetched = true // prevent auto-fetch so tests control when loading happens
}
