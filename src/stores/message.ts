import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Category, LexiconData } from '../utils/lexicon'

export interface MessageSegment {
  template: string
  wordCategory: Category | ''
  word: string
}

export interface MessageLine {
  segment1: MessageSegment
  conjunction: string
  segment2: MessageSegment
}

export interface MessageLine2 extends MessageLine {
  startConjunction: string
}

export interface HistoryItem {
  id: string
  mode: 'single' | 'double'
  line1: MessageLine
  line2: MessageLine2
  text: string
  timestamp: number
}

export const useMessageStore = defineStore('message', () => {
  // State
  const mode = ref<'single' | 'double'>('single')

  const line1 = ref<MessageLine>({
    segment1: { template: '', wordCategory: '', word: '' },
    conjunction: '',
    segment2: { template: '', wordCategory: '', word: '' },
  })

  const line2 = ref<MessageLine2>({
    startConjunction: '',
    segment1: { template: '', wordCategory: '', word: '' },
    conjunction: '',
    segment2: { template: '', wordCategory: '', word: '' },
  })

  const history = ref<HistoryItem[]>([])

  // Persistence
  const STORAGE_KEY = 'elden-ring-advice-state'

  function loadState() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        mode.value = data.mode || 'single'
        if (data.line1) {
          line1.value = data.line1
          line2.value = data.line2
        }
        history.value = data.history || []
      } catch (e) {
        console.error('Failed to load state from local storage', e)
      }
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: mode.value,
        line1: line1.value,
        line2: line2.value,
        history: history.value,
      }),
    )
  }

  // Watch for changes to save state
  watch(
    [mode, line1, line2, history],
    () => {
      saveState()
    },
    { deep: true },
  )

  // Helper to format a segment
  function formatSegment(seg: MessageSegment) {
    if (!seg.template) return '...'
    if (seg.template.includes('*****')) {
      return seg.template.replaceAll('*****', seg.word || '...')
    }
    return seg.template
  }

  function randomize(lexicon: LexiconData) {
    const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    const categories = Object.keys(lexicon.words) as Category[]

    const createRandomSegment = (): MessageSegment => {
      const template = randomItem(lexicon.templates)
      let wordCategory: Category | '' = ''
      let word = ''

      if (template.includes('*****')) {
        wordCategory = randomItem(categories)
        word = randomItem(lexicon.words[wordCategory])
      }

      return { template, wordCategory, word }
    }

    // Randomize Mode
    mode.value = Math.random() > 0.5 ? 'single' : 'double'

    // Line 1
    const l1Seg1 = createRandomSegment()
    const l1HasSeg2 = Math.random() > 0.5
    const l1Conj = l1HasSeg2 ? randomItem(lexicon.conjunctions) : ''
    const l1Seg2 = l1HasSeg2 ? createRandomSegment() : { template: '', wordCategory: '', word: '' }

    line1.value = {
      segment1: l1Seg1,
      conjunction: l1Conj,
      segment2: l1Seg2,
    }

    // Line 2
    const l2StartConj = Math.random() > 0.5 ? randomItem(lexicon.conjunctions) : ''
    const l2Seg1 = createRandomSegment()
    const l2HasSeg2 = Math.random() > 0.5
    const l2Conj = l2HasSeg2 ? randomItem(lexicon.conjunctions) : ''
    const l2Seg2 = l2HasSeg2 ? createRandomSegment() : { template: '', wordCategory: '', word: '' }

    line2.value = {
      startConjunction: l2StartConj,
      segment1: l2Seg1,
      conjunction: l2Conj,
      segment2: l2Seg2,
    }
  }

  function formatLine(line: MessageLine) {
    let text = formatSegment(line.segment1)
    if (line.conjunction) {
      if (line.conjunction !== '，') {
        text += '，'
      }
      text += line.conjunction + formatSegment(line.segment2)
    }
    return text
  }

  // Computed full text
  const currentMessageText = computed(() => {
    const l1 = formatLine(line1.value)
    if (mode.value === 'single') {
      return l1
    }

    let l2 = formatLine(line2.value)
    const startConj = line2.value.startConjunction

    if (startConj && startConj !== '，') {
      l2 = startConj + '' + l2
    }

    return `${l1}\n${l2}`
  })

  // Actions
  function generate() {
    const text = currentMessageText.value

    // Check for duplicates in history (based on text content for simplicity, or deep equality of state)
    // If exists, remove it so we can add it to the top with new timestamp
    const existingIndex = history.value.findIndex((h) => h.text === text)
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1)
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      line1: JSON.parse(JSON.stringify(line1.value)),
      line2: JSON.parse(JSON.stringify(line2.value)),
      mode: mode.value,
      text,
      timestamp: Date.now(),
    }

    history.value.unshift(newItem)
    if (history.value.length > 100) {
      history.value.pop()
    }
  }

  function loadFromHistory(item: HistoryItem) {
    mode.value = item.mode
    line1.value = JSON.parse(JSON.stringify(item.line1))
    line2.value = JSON.parse(JSON.stringify(item.line2))
  }

  function deleteHistoryItem(id: string) {
    const index = history.value.findIndex((h) => h.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
  }

  function getShareUrl(item?: HistoryItem) {
    const stateToShare = item
      ? {
          m: item.mode,
          l1: item.line1,
          l2: item.line2,
        }
      : {
          m: mode.value,
          l1: line1.value,
          l2: line2.value,
        }

    const json = JSON.stringify(stateToShare)
    const encoded = btoa(encodeURIComponent(json))
    const url = new URL(window.location.href)
    url.searchParams.set('s', encoded)
    return url.toString()
  }

  function loadFromUrl() {
    // Always load state first to preserve history
    loadState()

    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('s')
    if (encoded) {
      try {
        const json = decodeURIComponent(atob(encoded))
        const data = JSON.parse(json)

        if (data.m) mode.value = data.m
        if (data.l1) line1.value = data.l1
        if (data.l2) line2.value = data.l2

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)

        // Auto-save shared message to history
        generate()
      } catch (e) {
        console.error('Failed to load from URL', e)
      }
    }
  }

  return {
    mode,
    line1,
    line2,
    history,
    currentMessageText,
    generate,
    deleteHistoryItem,
    loadFromHistory,
    getShareUrl,
    loadFromUrl,
    randomize,
  }
})
