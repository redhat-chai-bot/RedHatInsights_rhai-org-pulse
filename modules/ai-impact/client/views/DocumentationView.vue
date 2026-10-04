<script setup>
import { computed, watch } from 'vue'
import { useDocumentation } from '../composables/useDocumentation.js'
import { useDocMrKpi } from '../composables/useDocMrKpi.js'
import { useProjectId } from '@shared/client/composables/useProjectId.js'
import DocumentationContent from '../components/DocumentationContent.vue'
import ProjectDesignDocsView from '../components/ProjectDesignDocsView.vue'
import AIImpactGuide from '../components/AIImpactGuide.vue'

const { docData, loading, error, load } = useDocumentation()
const { mrKpiData, load: loadMrKpi } = useDocMrKpi()

// OSAC keeps its docs pipeline; every other project shows its own collected
// design-doc presence.
const projectId = useProjectId()
const isOsac = computed(() => !projectId.value || projectId.value === 'osac')

// Reload OSAC doc data when switching back to OSAC from another project
watch(isOsac, (nowOsac) => {
  if (nowOsac) {
    load()
    loadMrKpi()
  }
})
</script>

<template>
  <div class="flex h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
    <ProjectDesignDocsView v-if="!isOsac" />
    <DocumentationContent
      v-else
      :loading="loading"
      :error="error"
      :docData="docData"
      :mrKpiData="mrKpiData"
      @retry="load"
    />
    <AIImpactGuide defaultTab="enablement" />
  </div>
</template>
