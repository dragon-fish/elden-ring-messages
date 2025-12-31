<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { loadLexicon, type LexiconData } from '../utils/lexicon'
import { useMessageStore, type HistoryItem } from '../stores/message'
import MessageLine from './MessageLine.vue'

const store = useMessageStore()
const { mode, line1, line2, currentMessageText, history } = storeToRefs(store)

const lexicon = ref<LexiconData | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    lexicon.value = await loadLexicon()

    // Initialize store from URL or LocalStorage
    store.loadFromUrl(lexicon.value)

    // Set defaults if empty (first load ever)
    if (!line1.value.segment1.template && lexicon.value.templates.length > 0) {
      line1.value.segment1.template = lexicon.value.templates[0] || ''
      line2.value.segment1.template = lexicon.value.templates[0] || ''
    }
  } catch (e) {
    console.error('Failed to load lexicon', e)
  } finally {
    loading.value = false
  }
})

function handleGenerate() {
  store.generate()
}

function handleRandomize() {
  if (lexicon.value) {
    store.randomize(lexicon.value)
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  alert('谏言已复制到剪贴板！')
}

function shareItem(item: HistoryItem) {
  if (!lexicon.value) return
  const url = store.getShareUrl(lexicon.value, item)
  navigator.clipboard.writeText(url)
  alert('分享链接已复制到剪贴板！')
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="builder-container">
    <div v-if="loading" class="loading">正在读取记忆...</div>

    <div v-else-if="lexicon" class="builder-content">
      <div class="mode-switch">
        <button :class="{ active: mode === 'single' }" @click="mode = 'single'">单行谏言</button>
        <button :class="{ active: mode === 'double' }" @click="mode = 'double'">双行谏言</button>
      </div>

      <MessageLine :lexicon="lexicon" v-model="line1" />

      <div v-if="mode === 'double'" class="second-line-group">
        <MessageLine :lexicon="lexicon" v-model="line2" :has-start-conjunction="true" />
      </div>

      <div class="preview-section">
        <div class="preview-box">
          {{ currentMessageText }}
        </div>
        <div class="action-buttons">
          <button class="action-btn" @click="handleGenerate">生成谏言</button>
          <button class="action-btn secondary" @click="handleRandomize">随机谏言</button>
        </div>
      </div>

      <div v-if="history.length > 0" class="history-section">
        <h2>历史记录</h2>
        <div class="history-list">
          <div v-for="item in history" :key="item.id" class="history-item">
            <div class="history-content" @click="store.loadFromHistory(item)">
              <pre>{{ item.text }}</pre>
              <span class="timestamp">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="history-actions">
              <button @click="copyText(item.text)" title="复制文本">📋</button>
              <button @click="shareItem(item)" title="复制分享链接">🔗</button>
              <button @click="store.deleteHistoryItem(item.id)" title="删除" class="delete-btn">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.builder-container {
  max-width: 800px;
  margin: 0 auto;
  color: #d4c4a8;
  font-family: serif;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mode-switch {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.mode-switch button {
  background: transparent;
  border: 1px solid #5a5a5a;
  color: #888;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;
}

.mode-switch button.active {
  border-color: #d4c4a8;
  color: #d4c4a8;
  background: rgba(212, 196, 168, 0.1);
}

.conjunction-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conjunction-section select {
  padding: 0.5rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #5a5a5a;
  font-family: inherit;
  width: 100%;
}

.second-line-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #5a5a5a;
}

.preview-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.preview-box {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #5a5a5a;
  padding: 2rem;
  min-width: 300px;
  text-align: center;
  white-space: pre-wrap;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.action-btn {
  background: #4a3b2a;
  color: #d4c4a8;
  border: 1px solid #8c7b60;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #5e4d38;
  border-color: #d4c4a8;
}

.action-btn.secondary {
  background: #333;
  border-color: #666;
  color: #ccc;
}

.action-btn.secondary:hover {
  background: #444;
  border-color: #888;
}

.history-section {
  margin-top: 3rem;
  border-top: 1px solid #5a5a5a;
  padding-top: 1rem;
}

.history-section h2 {
  font-size: 1.2rem;
  color: #8c7b60;
  margin-bottom: 1rem;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  padding: 0.5rem;
  transition: background 0.2s;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-content {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.history-content pre {
  font-family: inherit;
  margin: 0;
  white-space: pre-wrap;
}

.timestamp {
  font-size: 0.8rem;
  color: #666;
}

.history-actions {
  display: flex;
  gap: 0.5rem;
}

.history-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.history-actions button:hover {
  opacity: 1;
}

.delete-btn:hover {
  color: #ff4444;
}
</style>
