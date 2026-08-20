import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AgentContent from '../../client/components/AgentContent.vue'

describe('AgentContent', () => {
  const sampleData = {
    fetchedAt: '2026-07-07T10:00:00Z',
    jiraHost: 'https://redhat.atlassian.net',
    metrics: {
      totalIssues: 7,
      byState: { new: 4, 'ready-to-solve': 0, 'in-progress': 2, closed: 1 },
      processedCount: 1,
      processedRate: 14
    },
    issues: [
      { key: 'OCPBUGS-1', summary: 'HyperShift bug', status: 'New', agentState: 'new', processed: false, issueType: 'Bug', priority: 'Major', created: '2026-07-01', updated: '2026-07-07', labels: [], components: ['HyperShift'], assignee: null },
      { key: 'CNTRLPLANE-10', summary: 'Installer issue', status: 'In Progress', agentState: 'in-progress', processed: true, issueType: 'Bug', priority: 'Critical', created: '2026-07-02', updated: '2026-07-06', labels: ['agent-processed'], components: ['Installer / openshift-installer'], assignee: 'Jane' },
      { key: 'OCPBUGS-2', summary: 'Hosted CP bug', status: 'Closed', agentState: 'closed', processed: false, issueType: 'Bug', priority: 'Minor', created: '2026-07-03', updated: '2026-07-05', labels: [], components: ['Hosted Control Planes'], assignee: null },
      { key: 'TRT-100', summary: 'TRT test fix', status: 'New', agentState: 'new', processed: false, issueType: 'Task', priority: 'Major', created: '2026-07-04', updated: '2026-07-07', labels: [], components: [], assignee: null },
      { key: 'WINC-50', summary: 'WMCO network issue', status: 'New', agentState: 'new', processed: false, issueType: 'Bug', priority: 'Major', created: '2026-07-05', updated: '2026-07-07', labels: [], components: ['Networking / windows-machine-config-operator'], assignee: null },
      { key: 'MCO-200', summary: 'MCO config drift', status: 'In Progress', agentState: 'in-progress', processed: false, issueType: 'Bug', priority: 'Critical', created: '2026-07-05', updated: '2026-07-07', labels: [], components: ['Machine Config Operator'], assignee: 'Bob' },
      { key: 'NE-30', summary: 'Router reload bug', status: 'New', agentState: 'new', processed: false, issueType: 'Bug', priority: 'Major', created: '2026-07-06', updated: '2026-07-07', labels: [], components: ['Networking / router'], assignee: null }
    ]
  }

  it('renders stat cards with metrics', () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    expect(wrapper.text()).toContain('7')
    expect(wrapper.text()).toContain('Total Issues')
    expect(wrapper.text()).toContain('Ready to Solve')
    expect(wrapper.text()).toContain('14%')
  })

  it('renders issue table with component column', () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    expect(wrapper.text()).toContain('OCPBUGS-1')
    expect(wrapper.text()).toContain('HyperShift bug')
    expect(wrapper.text()).toContain('HyperShift')
    expect(wrapper.text()).toContain('Installer / openshift-installer')
  })

  it('shows team selector buttons with inline stats', () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const allBtn = buttons.find(b => b.text().includes('All Teams'))
    expect(allBtn.exists()).toBe(true)
    expect(allBtn.text()).toContain('total')
    expect(allBtn.text()).toContain('closed')
    expect(allBtn.text()).toContain('wip')
    expect(buttons.some(b => b.text().includes('HyperShift'))).toBe(true)
    expect(buttons.some(b => b.text().includes('Installer'))).toBe(true)
    expect(buttons.some(b => b.text().includes('TRT'))).toBe(true)
    expect(buttons.some(b => b.text().includes('Windows Containers'))).toBe(true)
    expect(buttons.some(b => b.text().includes('MCO'))).toBe(true)
    expect(buttons.some(b => b.text().includes('Ingress'))).toBe(true)
  })

  it('filters issues by team when team button is clicked', async () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const installerBtn = buttons.find(b => b.text().includes('Installer'))
    await installerBtn.trigger('click')

    expect(wrapper.text()).toContain('CNTRLPLANE-10')
    expect(wrapper.text()).not.toContain('OCPBUGS-1')
    expect(wrapper.text()).not.toContain('OCPBUGS-2')
  })

  it('filters TRT issues by project prefix', async () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const trtBtn = buttons.find(b => b.text().includes('TRT'))
    await trtBtn.trigger('click')

    expect(wrapper.text()).toContain('TRT-100')
    expect(wrapper.text()).not.toContain('OCPBUGS-1')
    expect(wrapper.text()).not.toContain('CNTRLPLANE-10')
  })

  it('filters Windows Containers issues by component', async () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const winBtn = buttons.find(b => b.text().includes('Windows Containers'))
    await winBtn.trigger('click')

    expect(wrapper.text()).toContain('WINC-50')
    expect(wrapper.text()).not.toContain('OCPBUGS-1')
    expect(wrapper.text()).not.toContain('MCO-200')
  })

  it('filters MCO issues by component', async () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const mcoBtn = buttons.find(b => b.text().includes('MCO'))
    await mcoBtn.trigger('click')

    expect(wrapper.text()).toContain('MCO-200')
    expect(wrapper.text()).not.toContain('OCPBUGS-1')
    expect(wrapper.text()).not.toContain('WINC-50')
  })

  it('filters Ingress issues by component', async () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: sampleData, loading: false, error: null }
    })
    const buttons = wrapper.findAll('button')
    const ingressBtn = buttons.find(b => b.text().includes('Ingress'))
    await ingressBtn.trigger('click')

    expect(wrapper.text()).toContain('NE-30')
    expect(wrapper.text()).not.toContain('OCPBUGS-1')
    expect(wrapper.text()).not.toContain('MCO-200')
  })

  it('shows empty state when no data', () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: null, loading: false, error: null }
    })
    expect(wrapper.text()).toContain('No data available')
  })

  it('shows error state with retry', () => {
    const wrapper = mount(AgentContent, {
      props: { agentData: null, loading: false, error: 'Connection failed' }
    })
    expect(wrapper.text()).toContain('Connection failed')
    expect(wrapper.text()).toContain('Retry')
  })
})
