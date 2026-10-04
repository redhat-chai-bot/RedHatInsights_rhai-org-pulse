import { ref, watch } from 'vue'
import { apiRequest } from '@shared/client/services/api.js'
import { useProjectId, projectQuery } from '@shared/client/composables/useProjectId.js'

export function useComponentOnboarding() {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const detailCache = ref({})

  async function load() {
    loading.value = true
    error.value = null
    try {
      data.value = await apiRequest(`/modules/ai-impact/component-onboarding${projectQuery(useProjectId().value)}`)
      // Clear detail cache so stale details from a prior project don't leak
      detailCache.value = {}
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadDetail(key) {
    const projectId = useProjectId().value
    const cacheKey = projectId ? `${projectId}::${key}` : key
    if (detailCache.value[cacheKey]) return
    try {
      const requestedProjectId = projectId
      const detail = await apiRequest(`/modules/ai-impact/component-onboarding/${encodeURIComponent(key)}${projectQuery(requestedProjectId)}`)
      // Discard if project changed while request was in flight
      if (useProjectId().value !== requestedProjectId) return
      const storageKey = requestedProjectId ? `${requestedProjectId}::${key}` : key
      detailCache.value[storageKey] = detail
    } catch (e) {
      console.error(`[component-onboarding] Failed to load detail for ${key}:`, e.message)
    }
  }

  load()

  // Re-fetch when project changes
  watch(useProjectId(), () => load())

  return { data, loading, error, load, loadDetail, detailCache }
}
