<script setup lang="ts">
import { computed, watch } from 'vue'
import { type Category, CATEGORIES, type LexiconData } from '../utils/lexicon'

const props = defineProps<{
  lexicon: LexiconData
  modelValue: {
    template: string
    wordCategory: Category | ''
    word: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()

const allTemplates = computed(() => {
  return props.lexicon.templates
})

const hasPlaceholder = computed(() => {
  return props.modelValue.template.includes('*****')
})

const categories = computed(() => {
  return Object.entries(CATEGORIES).map(([key, label]) => ({
    key: key as Category,
    label,
  }))
})

const availableWords = computed(() => {
  if (!props.modelValue.wordCategory) return []
  return props.lexicon.words[props.modelValue.wordCategory] || []
})

// Watchers to reset dependent fields
watch(
  () => props.modelValue.template,
  (newTemplate) => {
    if (!newTemplate.includes('*****')) {
      emit('update:modelValue', {
        ...props.modelValue,
        wordCategory: '',
        word: '',
      })
    } else if (!props.modelValue.wordCategory) {
      // Default to first category if none selected
      emit('update:modelValue', {
        ...props.modelValue,
        wordCategory: 'enemies',
      })
    }
  },
)

watch(
  () => props.modelValue.wordCategory,
  (newCategory) => {
    if (newCategory) {
      // Reset word when category changes
      emit('update:modelValue', {
        ...props.modelValue,
        word: props.lexicon.words[newCategory]?.[0] || '',
      })
    }
  },
)

function updateTemplate(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  emit('update:modelValue', { ...props.modelValue, template: val })
}

function updateCategory(event: Event) {
  const val = (event.target as HTMLSelectElement).value as Category
  emit('update:modelValue', { ...props.modelValue, wordCategory: val })
}

function updateWord(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  emit('update:modelValue', { ...props.modelValue, word: val })
}
</script>

<template>
  <div class="message-part">
    <div class="control-group">
      <label>模板</label>
      <select :value="modelValue.template" @change="updateTemplate">
        <option value="" disabled>选择模板...</option>
        <option v-for="t in allTemplates" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div v-if="hasPlaceholder" class="word-selection">
      <div class="control-group">
        <label>词汇类别</label>
        <select :value="modelValue.wordCategory" @change="updateCategory">
          <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
      </div>

      <div class="control-group">
        <label>词汇</label>
        <select :value="modelValue.word" @change="updateWord">
          <option v-for="w in availableWords" :key="w" :value="w">{{ w }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-part {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #4a4a4a;
}

.word-selection {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
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
</style>
