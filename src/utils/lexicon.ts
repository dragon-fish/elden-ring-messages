export type Category =
  | 'enemies'
  | 'characters'
  | 'items'
  | 'bodyparts'
  | 'attributes'
  | 'concepts'
  | 'situations'
  | 'locations'
  | 'directions'
  | 'tactics'
  | 'sentences'

export const CATEGORIES: Record<Category, string> = {
  enemies: '敌人',
  characters: '人物',
  items: '道具',
  bodyparts: '身体部位',
  attributes: '属性',
  concepts: '概念',
  situations: '情况',
  locations: '场所',
  directions: '方位',
  tactics: '战术',
  sentences: '成句',
}

export interface LexiconData {
  templates: string[]
  conjunctions: string[]
  words: Record<Category, string[]>
}

const BASE_URL = '/lexicon/zh-CN/'

async function fetchLines(filename: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}${filename}`)
  const text = await response.text()
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export async function loadLexicon(): Promise<LexiconData> {
  const [
    templates,
    sentences,
    conjunctions,
    enemies,
    characters,
    items,
    bodyparts,
    attributes,
    concepts,
    situations,
    locations,
    directions,
    tactics,
  ] = await Promise.all([
    fetchLines('templates.txt'),
    fetchLines('sentences.txt'),
    fetchLines('conjunctions.txt'),
    fetchLines('enemies.txt'),
    fetchLines('characters.txt'),
    fetchLines('items.txt'),
    fetchLines('bodyparts.txt'),
    fetchLines('attributes.txt'),
    fetchLines('concepts.txt'),
    fetchLines('situations.txt'),
    fetchLines('locations.txt'),
    fetchLines('directions.txt'),
    fetchLines('tactics.txt'),
  ])

  return {
    templates,
    conjunctions,
    words: {
      enemies,
      characters,
      items,
      bodyparts,
      attributes,
      concepts,
      situations,
      locations,
      directions,
      tactics,
      sentences,
    },
  }
}
