export interface ConsentTerm {
  id: string
  title: string
  required: boolean
  summary: string
  content: string[]
}

export interface ConsentCategory {
  id: string
  title: string
  required: boolean
  terms: ConsentTerm[]
}

export interface ConsentDefinition {
  domain: 'certificate' | 'account' | 'transfer' | 'signup'
  version: 'v1'
  categories: ConsentCategory[]
}

export function flattenTerms(definition: ConsentDefinition) {
  return definition.categories.flatMap((category) => category.terms)
}

export function getRequiredTermIds(definition: ConsentDefinition) {
  return flattenTerms(definition)
    .filter((term) => term.required)
    .map((term) => term.id)
}

export function findCategory(definition: ConsentDefinition, categoryId: string) {
  return definition.categories.find((category) => category.id === categoryId) ?? null
}

export function findTerm(definition: ConsentDefinition, termId: string) {
  for (const category of definition.categories) {
    const found = category.terms.find((term) => term.id === termId)
    if (found) return found
  }
  return null
}
