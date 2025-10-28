import type { AllergenItem } from '../search/search'

function esc(s: string) {
  const div = document.createElement('div')
  div.innerText = s
  return div.innerHTML
}

export function renderResults(container: HTMLElement, items: AllergenItem[], q: string) {
  container.innerHTML = ''
  if (items.length === 0) {
    container.innerHTML = `<div class="meta">검색 결과가 없습니다.</div>`
    return
  }
  const frag = document.createDocumentFragment()
  for (const item of items) {
    const card = document.createElement('div')
    card.className = 'card'
    const nameHtml = highlight(esc(item.name), q)
    const ige = item.ige != null ? `IgE: ${item.ige}` : ''
    const nonIge = item.nonIge != null ? ` 비IgE: ${item.nonIge}` : ''
    const tags = item.tags?.length ? ` · ${item.tags.join(', ')}` : ''
    card.innerHTML = `
      <h3 role="listitem">${nameHtml}</h3>
      <div class="meta">${[ige, nonIge].filter(Boolean).join(' ')}${tags}</div>
    `
    frag.appendChild(card)
  }
  container.appendChild(frag)
}

export function renderSuggestions(container: HTMLElement, items: AllergenItem[], onPick: (name: string)=>void) {
  container.innerHTML = ''
  for (const item of items) {
    const pill = document.createElement('button')
    pill.type = 'button'
    pill.className = 'pill'
    pill.setAttribute('role', 'listitem')
    pill.textContent = item.name
    pill.addEventListener('click', () => onPick(item.name))
    container.appendChild(pill)
  }
}

function highlight(text: string, q: string) {
  if (!q) return text
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(re, '<span class="highlight">$1</span>')
}
