<script setup lang="ts">
import { computed, ref } from 'vue'
import { type LexiconData } from '../utils/lexicon'
import { type MessageLine, type MessageLine2 } from '../stores/message'
import MessagePart from './MessagePart.vue'

const props = defineProps<{
  lexicon: LexiconData
  modelValue: MessageLine | MessageLine2
  hasStartConjunction?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MessageLine | MessageLine2): void
}>()

const line = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const hasSecondSegment = computed(() => {
  return !!line.value.conjunction
})

const stashedConjunction = ref('')

function toggleSecondSegment() {
  if (hasSecondSegment.value) {
    // Remove second segment (hide it)
    // Stash the conjunction so we can restore it later
    stashedConjunction.value = line.value.conjunction
    
    const newLine = { ...line.value }
    newLine.conjunction = ''
    // Do NOT clear segment2 data, so it persists if user toggles back
    emit('update:modelValue', newLine)
  } else {
    // Add second segment
    const newLine = { ...line.value }
    // Restore stashed conjunction or use default
    newLine.conjunction = stashedConjunction.value || props.lexicon.conjunctions[0] || ''
    
    // Initialize segment2 only if it's empty (never used or cleared in old version)
    if (!newLine.segment2.template && props.lexicon.templates.length > 0) {
      newLine.segment2 = { template: props.lexicon.templates[0], wordCategory: '', word: '' }
    }
    emit('update:modelValue', newLine)
  }
}

function updateStartConjunction(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  const newLine = { ...line.value } as MessageLine2
  newLine.startConjunction = val
  emit('update:modelValue', newLine)
}

function updateConjunction(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  const newLine = { ...line.value }
  newLine.conjunction = val
  emit('update:modelValue', newLine)
}
</script>

<template>
  <div class="message-line">
    <div v-if="hasStartConjunction" class="start-conjunction">
      <label>连接词 (行首)</label>
      <select :value="(line as MessageLine2).startConjunction" @change="updateStartConjunction">
        <option value="">(无)</option>
        <option v-for="c in lexicon.conjunctions" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <MessagePart :lexicon="lexicon" v-model="line.segment1" />

    <div class="conjunction-toggle">
      <button @click="toggleSecondSegment" class="toggle-btn">
        {{ hasSecondSegment ? '- 移除后半段' : '+ 添加后半段' }}
      </button>
    </div>

    <div v-if="hasSecondSegment" class="second-segment">
      <div class="conjunction-section">
        <label>连接词</label>
        <select :value="line.conjunction" @change="updateConjunction">
          <option v-for="c in lexicon.conjunctions" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <MessagePart :lexicon="lexicon" v-model="line.segment2" />
    </div>
  </div>
</template>

<style scoped>
.message-line {
  border: 1px solid #444;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.start-conjunction,
.conjunction-section {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #a0a0a0;
}

select {
  padding: 0.5rem;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #5a5a5a;
  font-family: inherit;
}

.conjunction-toggle {
  margin: 0.5rem 0;
  text-align: center;
}

.toggle-btn {
  background: none;
  border: 1px dashed #666;
  color: #aaa;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.toggle-btn:hover {
  border-color: #888;
  color: #ccc;
}

.second-segment {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #444;
}
</style>
