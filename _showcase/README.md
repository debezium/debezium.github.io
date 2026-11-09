# Debezium Community Showcase – Slides

This directory is a small [Marp](https://marp.app/) project that produces the slide decks for the
[Debezium Community Showcase](https://debezium.io/community/showcase/). Each showcase episode is one Markdown deck.

This guide explains how to:

1. [Run the slides locally](#running-the-slides-locally)
2. [Add a new episode](#adding-a-new-episode)
3. [Preview the result on the full website](#previewing-on-the-full-website)

## How it fits together

One set of source files feeds two renderers, so you only edit each fact once.

| Piece | Location | Purpose |
|-------|----------|---------|
| Episode deck | `deck/src/episodes/<nnn>/index.md` | Slides **and** the episode metadata (date, YouTube video, sessions) |
| Intro text | `deck/src/showcase/intro.yml` | Text and image of the "intro" slide, shared by all episodes |
| Speakers | [`../_data/authors.yaml`](../_data/authors.yaml) | Name, bio and avatar of every speaker (shared with the blog) |
| Theme | `deck/src/themes/debezium.css` | Slide styling |
| Marp engine | `engine.mjs`, `marp.config.mjs` | Turns the special code fences (`episode`, `intro`, `agenda`, `speaker`) into HTML |
| Landing page | [`../_plugins/showcase.rb`](../_plugins/showcase.rb), [`../_layouts/showcase.html`](../_layouts/showcase.html) | Jekyll reads the same decks to render the episode list at `/community/showcase/` |

Generated output (`public/`, and `community/showcase/episodes` and `community/showcase/showcase` in the site root)
is git-ignored. Never edit it by hand.

## Running the slides locally

### Prerequisites

* Node.js (recent LTS)
* `yarn` (used by the website build image) **or** `npm`

### Install and start

From this directory:

```shell
cd _showcase

# with yarn (matches the website build)
yarn install --frozen-lockfile
yarn start

# or with npm
npm install
npm run start
```

`start` runs Marp in server mode on **port 5001** with live reload:

```
PORT=5001 marp --html -ps deck/src
```

Open <http://localhost:5001/> and browse to your episode, for example <http://localhost:5001/episodes/002/>.
Saving `index.md` refreshes the browser.

> **Note:** speakers and intro text are read from `../_data/authors.yaml` and `deck/src/showcase/intro.yml` when the
> server starts. After changing either file, restart `yarn start`.

### Other commands

| Command | What it does |
|---------|--------------|
| `yarn build` / `npm run build` | Renders all decks into `public/` (the same step the site build runs) |
| `yarn pdf deck/src/episodes/002/index.md -o 002.pdf` | Exports one deck to PDF (requires a local Chrome/Chromium) |

With npm, pass the arguments after `--`: `npm run pdf -- deck/src/episodes/002/index.md -o 002.pdf`.

## Adding a new episode

### 1. Make sure every speaker exists in `authors.yaml`

Speakers are **not** defined in the deck. A session refers to a speaker by their author id from
[`_data/authors.yaml`](../_data/authors.yaml).

If a speaker is missing, add an entry there and put the avatar in `assets/images/`:

```yaml
jdoe:
  name: "Jane Doe"
  bio: "One or two sentences about Jane. Longer bios are trimmed on the slides."
  github: jdoe
  avatar: jdoe.jpg        # file in assets/images/
```

Bios longer than about 145 characters are cut at the end of a sentence for the slide subtitle, so put the most
important sentence first. An id that is missing from `authors.yaml` shows up on the slides as *"Unknown author: …"*.

### 2. Create the episode directory

Directories are named with the episode number, zero padded to three digits. Episodes are sorted by directory name, newest
(highest) first.

```shell
mkdir _showcase/deck/src/episodes/003
cp _showcase/deck/src/episodes/001/index.md _showcase/deck/src/episodes/003/index.md
```

Start from episode `001` for an episode with several sessions, or from `002` for an episode that has a single special
session.

### 3. Fill in the episode metadata

The metadata lives in the `` ```episode `` code block at the top of `index.md`:

````markdown
```episode
number: 003
date: December 2026
day: 15
youtube: Q46slutMeSA
light: ccranfor | What's cooking in Debezium?
regular: aandreakis | A Verified Theoretical Basis for Incremental Snapshots in Debezium
```
````

| Field | Required | Description |
|-------|----------|-------------|
| `number` | yes | Episode number shown on the slides and the landing page (use the same value as the directory name) |
| `date` | yes | **`Month YYYY`**, for example `December 2026`. The format matters: it is used to decide whether the episode is upcoming |
| `day` | no | Day of the month. Without it the landing page shows only month and year |
| `youtube` | no | YouTube video id (the part after `v=`). Adds the embedded recording to the landing page |
| `draft` | no | `draft: true` builds the slides but hides the episode from the landing page |
| sessions | yes | One or more session lines, see below |

#### Sessions

A session line has the format `<type>: <speaker-id>[, <speaker-id>…] | <talk title>`.

| Type | Meaning |
|------|---------|
| `light` | Lightning session |
| `regular` | Regular session |
| `special` | Special session: a single talk that fills the whole episode (the agenda card is centered) |

For a co-presented talk, list several author ids separated by commas:

```
regular: ccranfor, aandreakis | A Talk Given by Two Speakers
```

### 4. Add the slides

Below the `episode` block, keep the standard sequence. The fences are placeholders that the engine expands into
slides, and slides are separated by `---`:

````markdown
```intro
```

---

```agenda
```

---

```speaker light
```

---

```speaker regular
```
````

* Add one `` ```speaker <type> `` slide for each session type used in the `episode` block.
* `` ```speaker <type> `` renders the **first** session of that type. Two `light` sessions in one episode are both
  shown on the agenda, but only the first one gets its own speaker slide. If you need more, add regular Markdown
  slides by hand.
* Keep the front matter (`theme: debezium`, `paginate: true`, `footer: _`) unchanged. The engine replaces the footer
  with `Debezium Community Showcase - <date> - Episode #<number>`.
* You can add ordinary Marp Markdown slides between the generated ones.

### 5. Preview and verify

1. Run `yarn start` and open `http://localhost:5001/episodes/003/`.
2. Check that each speaker has a name, avatar and bio, and that no "Unknown author" or "Unknown session type" text is
   shown.
3. Optionally check the landing page, see [below](#previewing-on-the-full-website).

### 6. Publish

Open a pull request against `develop`. Commits must be signed off (`git commit -s`). Merging to `develop` triggers the
website build and publishes the episode.

### What visitors see

* **Upcoming episodes**: when `date` and `day` are in the future, the landing page shows an *Upcoming* badge instead of a
  *Slides* link.
* **Past episodes**: the landing page links to `/community/showcase/episodes/<nnn>/` and embeds the video when
  `youtube` is set. Add the video id once the recording is available.

## Previewing on the full website

The landing page is rendered by Jekyll, so use the Rake tasks from the **repository root** to see it:

```shell
rake showcase          # build only the slide decks into community/showcase
rake clean preview     # full site (Antora + Jekyll) at http://localhost:4000/community/showcase/
```

`rake showcase` prefers `yarn` and falls back to `npm`. Nothing needs to be committed from the generated
`community/showcase/episodes` and `community/showcase/showcase` directories.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Episode missing from the landing page | The `episode` fence is missing or malformed, or `draft: true` is set |
| "Unknown author: …" on a slide | The id in the session line is not a key of `_data/authors.yaml`, or the file was edited without restarting the server |
| "Unknown session type" on a speaker slide | A `` ```speaker <type> `` slide has no matching session line in the `episode` block |
| Avatar is broken | `avatar:` in `authors.yaml` must name a file that exists in `assets/images/` |
| Episode shown as *Upcoming* unexpectedly | `date` must be `Month YYYY` and combined with `day` lies in the future |
