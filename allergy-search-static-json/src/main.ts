import { search, type AllergenItem } from './search/search'
import { renderResults, renderSuggestions } from './ui/render'

async function loadData(): Promise<AllergenItem[]> {
  const res = await fetch('/data/allergens.json', { cache: 'force-cache' })
  if (!res.ok) throw new Error('데이터 로드 실패')
  return await res.json()
}

function setupSearch(all: AllergenItem[]) {
  const input = document.getElementById('q') as HTMLInputElement
  const resultsEl = document.getElementById('results') as HTMLElement
  const suggEl = document.getElementById('suggestions') as HTMLElement

  function run(q: string) {
    const { ranked, suggestions } = search(all, q)
    renderResults(resultsEl, ranked, q)
    renderSuggestions(suggEl, suggestions, (name) => {
      input.value = name
      run(name)
      input.focus()
    })
  }

  input.addEventListener('input', () => run(input.value))
  run(input.value)
}

loadData()
  .then(setupSearch)
  .catch(err => {
    console.error(err)
    const resultsEl = document.getElementById('results') as HTMLElement
    resultsEl.innerHTML = '<div class="meta">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>'
  })
