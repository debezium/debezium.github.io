import Marp from '@marp-team/marp-core/full'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Speakers come from the site-wide blog author directory (_data/authors.yaml),
// the same source the Jekyll landing page uses, so there is a single place to
// edit a speaker's name, bio and avatar. The file is a plain YAML map keyed by
// author id; this is a small hand parser for that regular format (quoted or
// bare single-line values, 1- or 2-space indented fields, # comments).
function loadAuthors() {
  const content = readFileSync(join(__dirname, '../_data/authors.yaml'), 'utf8')
  const authors = {}
  let current = null
  for (const raw of content.split('\n')) {
    const line = raw.replace(/\s+$/, '')
    if (line.trim() === '' || /^\s*#/.test(line)) continue
    const idLine = line.match(/^([A-Za-z0-9_-]+):\s*$/)
    if (idLine) {
      current = { nick: idLine[1] }
      authors[current.nick] = current
      continue
    }
    if (!current) continue
    const kv = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/)
    if (kv) current[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return authors
}

function loadIntro() {
  const content = readFileSync(join(__dirname, 'deck/src/showcase/intro.yml'), 'utf8')
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const intro = {}
  let currentKey = null
  let multiline = []
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*\|?\s*$/)
    if (kv) {
      if (currentKey) intro[currentKey] = multiline.join('\n').trim()
      currentKey = kv[1]
      multiline = []
      continue
    }
    const simple = line.match(/^(\w+):\s*(.+)$/)
    if (simple) {
      if (currentKey) { intro[currentKey] = multiline.join('\n').trim(); currentKey = null }
      intro[simple[1]] = simple[2].trim()
      continue
    }
    if (currentKey) multiline.push(line.replace(/^ {2}/, ''))
  }
  if (currentKey) intro[currentKey] = multiline.join('\n').trim()
  return intro
}

function mdLinks(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

function parseEpisode(content) {
  const ep = { sessions: [] }
  for (const line of content.trim().split('\n')) {
    const session = line.match(/^(light|regular|special):\s*(\w+)\s*\|\s*(.+)$/)
    if (session) {
      ep.sessions.push({ type: session[1], nick: session[2], talk: session[3].trim() })
      continue
    }
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (m) ep[m[1]] = m[2].trim()
  }
  return ep
}

// Per session-type colours and label, shared by every slide renderer and kept
// in step with the Jekyll landing page (_layouts/showcase.html):
//   light   -> accent (Lightning Session)
//   regular -> brand  (Regular Session)
//   special -> warn   (Special Session, a talk that fills the whole episode)
function sessionStyle(type) {
  if (type === 'light') {
    return { colorClass: 'accent', colorVar: 'var(--dbz-accent-strong)', borderColor: 'var(--dbz-accent)', label: 'Lightning Session' }
  }
  if (type === 'special') {
    return { colorClass: 'warn', colorVar: 'var(--dbz-warn)', borderColor: 'var(--dbz-warn)', label: 'Special Session' }
  }
  return { colorClass: 'brand', colorVar: 'var(--dbz-brand-strong)', borderColor: 'var(--dbz-brand)', label: 'Regular Session' }
}

function renderEpisode(ep) {
  return `<h2>Debezium</h2>
<h3>Debezium Community Showcase</h3>
<div align="right">
${ep.date} - Episode #${ep.number}
</div>\n`
}

function renderIntro(intro) {
  const paragraphs = intro.text.split('\n\n').map(p => `<p>${mdLinks(p.trim())}</p>`).join('\n')
  return `<h2>${intro.title}</h2>
<div class="wide-narrow" style="align-items:center;">
<div style="display:flex;flex-direction:column;justify-content:center;">
${paragraphs}
</div>
<div style="display:flex;align-items:center;justify-content:center;">
<img src="../../showcase/${intro.image}" style="max-height:380px;" />
</div>
</div>\n`
}

function renderAgenda(episode, authors) {
  // A special session stands in for the whole episode, so its single card is
  // centred rather than dropped into the left cell of the two-column grid.
  const hasSpecial = episode.sessions.some(s => s.type === 'special')

  const cards = episode.sessions.map(s => {
    const author = authors[s.nick]
    if (!author) return `<div class="card"><p>Unknown author: ${s.nick}</p></div>`

    const { colorClass, colorVar, borderColor, label } = sessionStyle(s.type)
    const cardStyle = `display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px 22px;${hasSpecial ? 'max-width:560px;' : ''}`

    return `<div class="card ${colorClass}" style="${cardStyle}">
<div style="font-size:0.6em;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${colorVar};margin-bottom:14px;">${label}</div>
<img src="/assets/images/${author.avatar}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid ${borderColor};margin-bottom:14px;" />
<div style="font-weight:700;font-size:1.1em;color:var(--dbz-text);">${author.name}</div>
<div style="color:var(--dbz-muted);font-size:0.82em;margin:4px 0 14px 0;">${author.bio}</div>
<div style="font-size:0.88em;color:${colorVar};font-weight:600;">${s.talk}</div>
</div>`
  }).join('\n')

  const container = hasSpecial
    ? `<div style="display:flex;justify-content:center;margin-top:12px;">\n${cards}\n</div>`
    : `<div class="cols" style="align-items:stretch;margin-top:12px;">\n${cards}\n</div>`

  return `<h2>Agenda</h2>\n${container}\n`
}

function renderSpeaker(type, episode, authors) {
  const session = episode.sessions.find(s => s.type === type)
  if (!session) return `<p>Unknown session type: ${type}</p>\n`
  const author = authors[session.nick]
  if (!author) return `<p>Unknown author: ${session.nick}</p>\n`

  const { borderColor } = sessionStyle(type)

  return `<h2>Debezium</h2>\n<h3>${session.talk}</h3>\n<div style="display:flex;align-items:center;gap:18px;margin-top:24px;">
<img src="/assets/images/${author.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid ${borderColor};flex-shrink:0;" />
<div>
<div style="font-weight:700;font-size:0.95em;color:var(--dbz-text);">${author.name}</div>
<div style="color:var(--dbz-muted);font-size:0.72em;">${author.bio}</div>
</div>
</div>\n`
}

function loadAllEpisodes() {
  const episodesDir = join(__dirname, 'deck/src/episodes')
  if (!existsSync(episodesDir)) return []
  return readdirSync(episodesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort((a, b) => b.name.localeCompare(a.name))
    .map(d => {
      const file = join(episodesDir, d.name, 'index.md')
      if (!existsSync(file)) return null
      const content = readFileSync(file, 'utf8')
      const fenceMatch = content.match(/```episode\n([\s\S]*?)```/)
      if (!fenceMatch) return null
      const ep = parseEpisode(fenceMatch[1])
      ep.dir = d.name
      return ep
    })
    .filter(Boolean)
}

function renderEpisodes(episodes, authors) {
  const listItems = episodes.map(ep =>
    `<a href="./episodes/${ep.dir}/" style="display:block;padding:12px 18px;margin-bottom:8px;background:var(--dbz-surface);border:1px solid var(--dbz-border);border-radius:10px;text-decoration:none;color:var(--dbz-text);transition:border-color 0.2s;">
<div style="font-weight:700;font-size:0.95em;">Episode #${ep.number}</div>
<div style="color:var(--dbz-muted);font-size:0.72em;">${ep.date}</div>
</a>`
  ).join('\n')

  const latest = episodes[0]
  let detailCards = ''
  if (latest) {
    detailCards = latest.sessions.map(s => {
      const author = authors[s.nick]
      if (!author) return ''
      const { colorClass, colorVar, borderColor, label } = sessionStyle(s.type)
      return `<div class="card ${colorClass}" style="display:flex;align-items:center;gap:16px;padding:16px 18px;margin-bottom:10px;">
<img src="/assets/images/${author.avatar}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid ${borderColor};flex-shrink:0;" />
<div style="min-width:0;">
<div style="font-size:0.55em;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${colorVar};margin-bottom:4px;">${label}</div>
<div style="font-weight:700;font-size:0.88em;color:var(--dbz-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.talk}</div>
<div style="font-size:0.72em;color:var(--dbz-muted);margin-top:2px;">${author.name} — ${author.bio}</div>
</div>
</div>`
    }).join('\n')
  }

  return `<h2>Debezium Community Showcase</h2>
<div class="narrow-wide" style="align-items:start;margin-top:8px;">
<div>
<h4 style="margin-bottom:10px;">Episodes</h4>
${listItems}
</div>
<div>
<h4 style="margin-bottom:10px;">Latest — Episode #${latest ? latest.number : '?'}</h4>
${detailCards}
</div>
</div>\n`
}

function deckDirectives(md, authors, intro, allEpisodes) {
  md.core.ruler.after('block', 'deck-directives', (state) => {
    let episode = null
    for (const token of state.tokens) {
      if (token.type === 'fence' && token.info.trim() === 'episode') {
        episode = parseEpisode(token.content)
        token.type = 'html_block'
        token.content = renderEpisode(episode)
      }
    }
    for (const token of state.tokens) {
      if (token.type !== 'fence') continue
      const info = token.info.trim()
      if (info === 'episodes') {
        token.type = 'html_block'
        token.content = renderEpisodes(allEpisodes, authors)
      } else if (info === 'intro') {
        token.type = 'html_block'
        token.content = renderIntro(intro)
      } else if (info === 'agenda' && episode) {
        token.type = 'html_block'
        token.content = renderAgenda(episode, authors)
      } else if (info.startsWith('speaker ') && episode) {
        const type = info.split(/\s+/)[1]
        token.type = 'html_block'
        token.content = renderSpeaker(type, episode, authors)
      }
    }
  })
}

export default class DeckEngine extends Marp {
  constructor(opts) {
    super(opts)
    const authors = loadAuthors()
    const intro = loadIntro()
    const allEpisodes = loadAllEpisodes()
    deckDirectives(this.markdown, authors, intro, allEpisodes)
  }

  render(markdown, env) {
    const result = super.render(markdown, env)
    const episodeMatch = markdown.match(/```episode\n([\s\S]*?)```/)
    if (episodeMatch) {
      const ep = parseEpisode(episodeMatch[1])
      const footer = `Debezium Community Showcase - ${ep.date} - Episode #${ep.number}`
      result.html = result.html.replace(/<footer>[^<]*<\/footer>/g, `<footer>${footer}</footer>`)
    }
    return result
  }
}
