# Release process

This guide explains how to update debezium.io when Debezium publishes a release. It is written for both people and coding agents, so it spells out every step, the files involved, and how to check the result.

Most of the site works out release information for itself. The homepage, the releases pages, the documentation overview, the navigation menus and the supported databases page all read the same data under `_data/`, so publishing a release is mostly a matter of adding data, not editing templates. The sections below say which files to change for each kind of release, and why.

The examples use a hypothetical 3.8 series. Substitute the real version numbers.

## Contents

- [Terms used in this guide](#terms-used-in-this-guide)
- [What updates on its own](#what-updates-on-its-own)
- [Every release](#every-release)
- [The first release of a new series](#the-first-release-of-a-new-series)
- [The Final release of a series](#the-final-release-of-a-series)
- [When a release adds a connector or a sink](#when-a-release-adds-a-connector-or-a-sink)
- [Retiring old series](#retiring-old-series)
- [The Antora playbooks](#the-antora-playbooks)
- [Checking your work](#checking-your-work)
- [Reference: release data files](#reference-release-data-files)
- [Pitfalls](#pitfalls)

## Terms used in this guide

- A **series** is a `<major>.<minor>` line such as `3.8`. It has its own documentation, release notes page and release history.
- A **release** is one published version within a series, such as `3.8.0.Alpha1`, `3.8.0.Final` or `3.8.1.Final`.
- A release is **stable** when it is a `Final`. Alpha, Beta and CR releases are previews.
- The **latest stable series** is the newest series whose most recent release is stable. The **development series** is a newer series that has only had previews so far. Between a `.0.Final` and the next `Alpha1` there is no development series.

## What updates on its own

You do not need to edit any of the following. They change as soon as the release data is in place:

- The homepage "Releases" section, including whether it shows two cards or three.
- The release series cards on `/releases/` and `/documentation/`, their "latest stable", "stable" and "development" labels, and the "Show older series" sections.
- The version lists in the Releases and Learn menus on the Jekyll side of the site.
- The tested versions shown on `/databases/`, which always follow the latest stable series.
- Links that point at "the current stable docs", such as the tutorial links on the homepage and the Why and Installation pages.

The navigation bar in the Antora documentation, including its version badges, is regenerated from the same data on every build. See the note at the end of [Every release](#every-release).

## Every release

Do these for every release, from `Alpha1` through to the last bugfix `Final`.

### 1. Write the announcement post

Add the blog post under `_posts/`, following the conventions of earlier release posts. Note its URL: it comes from the `date:` in the front matter, not from the file name, in the form `/blog/YYYY/MM/DD/<slug>/`. Release announcements should not set `featured: true`, because the homepage blog section is meant for other kinds of posts. Releases already have their own homepage section.

### 2. Add the release data file

Create `_data/releases/<series>/<version>.yml`, for example `_data/releases/3.8/3.8.0.Beta1.yml`:

```yaml
date: 2026-11-12
version: "3.8.0.Beta1"
stable: false
summary: "One or two sentences on the highlights of this release."
announcement_url: /blog/2026/11/12/debezium-3-8-beta1-released/
```

- `date` is the publication date, in `YYYY-MM-DD` form.
- `version` is the full version, quoted so YAML keeps it as text.
- `stable` is `true` only for `Final` releases. This one value drives the stable and preview badges, the "latest stable" logic and the homepage cards.
- `summary` is shown on the series page. Write it in plain language and aim for about 150 to 250 characters. The card shows at most three lines, so a long list of features is cut off.
- `announcement_url` is the path of the blog post from step 1. Leave the line out if the post is not published yet. Every place that links to the announcement hides the link when it is missing, so adding the release before its post goes live is fine.

Two optional keys are covered later in this guide: `connectors`, for connectors that first ship in this release (see [When a release adds a connector or a sink](#when-a-release-adds-a-connector-or-a-sink)), and `compatibility`, for tested versions that apply to this release only (see step 4).

### 3. Update the release notes

Add a section for the release at the top of `releases/<series>/release-notes.asciidoc`, above the previous release, following the existing entries:

```asciidoc
[[release-3.8.0-beta1]]
== *Release 3.8.0.Beta1* _(November 12th 2026)_
```

Each entry has the same subsections as the earlier ones: Kafka compatibility, Upgrading, Breaking changes, New features, Fixes and Other changes. The page builds its "On this page" sidebar from these headings, so keep the anchor and heading format exactly as shown.

### 4. Update the tested versions

Tested database, driver and runtime versions live under `compatibility:` in `_data/releases/<series>/series.yml`. The series file should always describe the most recent release in the series, so when a release is tested against new versions, update the series file.

If a particular release was tested against something different from the rest of the series, put a `compatibility:` block in that release's own file instead. For each entry it lists, the newest release's block takes precedence over the series default, entry by entry. That is how `3.7.0.Final.yml` reports Cassandra 5.0.8 while the series file still says 5.0.2.

The keys under `compatibility:` are test matrix ids, and each one must also be listed under `integrations:` in `_config.yml`. See [Reference: release data files](#reference-release-data-files) for the format.

### 5. Refresh the series overview

`overview:` in `series.yml` is the short description shown on the series cards and on the homepage. The homepage shows about 190 characters of it, and the series cards on `/releases/` and `/documentation/` about 150 and 130, so lead with the most important point. When a release changes what the series is about, update the overview to match.

### A note on the documentation navigation bar

The Antora documentation uses a navigation bar generated from `_data/navigation.yml` and the release data, including the version badges (latest stable, stable, development) in its Learn and Releases menus. You do not need to regenerate it for a release: `rake build`, which the deployment workflow runs, and `rake preview` both regenerate it before Antora runs, so the published documentation always matches the release data.

A copy is committed as `_antora/supplemental_ui/partials/dbz-navbar.hbs`, only so that running Antora by hand (see [ANTORA.md](./ANTORA.md)) works without a rake build first. That copy can lag behind without affecting the site. To refresh it anyway, run `rake antora_nav` and commit the result. Never edit the file by hand: the next build overwrites it.

## The first release of a new series

When a new series starts, usually with `Alpha1`, do the following in addition to [Every release](#every-release).

1. **Register the series.** Add it to the end of `_data/versions.yml`. The list runs oldest to newest, and several pages rely on that order.
2. **Create the series data.** Add `_data/releases/3.8/series.yml`. The easiest start is a copy of the previous series' file, then:
   - set `summary: Version 3.8 release stream` and `version: "3.8"`
   - write a fresh `overview`
   - set `displayed: true` and `hidden: false`
   - review the `connectors` list and the `compatibility` entries, dropping anything the new series no longer ships or tests.
3. **Create the series pages.** Add a `releases/3.8/` directory with two files, modelled on the previous series:
   - `index.asciidoc`, with front matter `layout: release-version`, `title: Debezium Release Series 3.8` and `debezium-version: "3.8"`
   - `release-notes.asciidoc`, with front matter `layout: release-notes`, `title: Release Notes for Debezium 3.8` and `debezium-version: "3.8"`, then the same `:toc:` attributes and introduction as the previous series.
4. **Check the playbooks.** Development documentation is built from `main` until the series has its own branch in the Debezium repository. Confirm that `page-version-devel` in both playbooks names the new series. See [The Antora playbooks](#the-antora-playbooks).
5. **Look at the older series.** Adding a series is a good moment to retire one. See [Retiring old series](#retiring-old-series).

## The Final release of a series

The `.0.Final` release makes the series the latest stable one. In addition to [Every release](#every-release):

1. Set `stable: true` in the release file. Everything else that depends on stability follows from it, and the previous stable series becomes "stable".
2. In both `playbook.yml` and `playbook_author.yml`, set `page-version-current` to the new series and `page-version-devel` to the next one. This controls which documentation version is published as `stable` and `devel`, and which banner each version shows.
3. Add the series branch to `content.sources[0].branches` in `playbook.yml` once it exists in the Debezium repository, so the series keeps its own documentation after `main` moves on.
4. Consider updating `roadmap.asciidoc` so the roadmap reflects what shipped.

Bugfix releases later in the series (`3.8.1.Final` and so on) only need [Every release](#every-release).

## When a release adds a connector or a sink

New connectors and sinks appear in several data files, and each one feeds a different part of the site. When a release introduces one, go through this list.

### `_data/connectors.yml`: download links

Every connector plug-in with a downloadable archive needs an entry:

```yaml
  - id: tidb
    title: TiDB Connector Plug-in
    artifact: debezium-connector-tidb
```

The `artifact` must match the Maven Central artifact name exactly: the download link is built as `https://repo1.maven.org/maven2/io/debezium/<artifact>/<version>/<artifact>-<version>-plugin.tar.gz`. A typo produces a broken download link, not a build error.

### `connectors` in the release data: which downloads each release offers

A release's download list combines the series-level `connectors:` list in `series.yml` with any `connectors:` list in the release's own file:

- **List a new connector in each release file**, starting from the release where it first ships. Adding it to the series list instead would show a download link on earlier releases, where no archive exists.
- **Move it to the series list** in the next series, once it is present in every release.
- **Remove a connector** from the series list when the series stops shipping it. For example, the 3.7 series list dropped `cassandra-3`, because no Cassandra 3 archive was published for 3.7.

Before you finish, check that every download link for the release resolves on Maven Central. A missing archive gives a 404 there.

### `_config.yml`: the test matrix

If the connector has tested versions, add it under `integrations:`. Java and Kafka Connect come first, then connectors in alphabetical order by `id`. The `name` is the label shown in the tested versions table on `/releases/`.

```yaml
  - id: tidb
    name: TiDB
```

Then add a `compatibility:` entry with the same id to the series file (step 4 of [Every release](#every-release)). If a new kind of tested attribute is needed, besides database, driver, plug-ins and so on, add it to `test_attributes:` in `_config.yml` too.

### `_data/databases.yml`: the supported databases page and homepage carousel

This file lists the sources and destinations on `/databases/` and in the homepage carousel. Add new sources under `sources:` and new destinations under `sinks:`.

A source looks like this:

```yaml
  - id: tidb
    name: TiDB
    href: /documentation/reference/stable/connectors/tidb.html
    status: incubating
```

- `id` matches the connector id in `connectors.yml`.
- `href` is the reference documentation. Only add it once the page is published: a source without `href` shows as an unlinked chip and its card has no documentation link. That is better than a link to a page that does not exist yet.
- `status` is `ga` or `incubating`. Sources are grouped with stable ones first and incubating ones second, alphabetical by name within each group, so place the entry accordingly. When a connector graduates, as CockroachDB did in 3.7, change its status and move it into the stable group.
- `compat` is only needed when the test matrix uses a different id, or covers the connector under several ids. PostgreSQL uses `compat: [postgresql]`, and Cassandra uses `compat: [cassandra-4, cassandra-5]` because it is tested per Cassandra version. Without `compat`, the `id` is used. If none of the ids match the latest stable series, the card says it is not covered by the test matrix, so check this whenever a card shows that message.

Destinations need `id`, `name` and, once documented, `href`. Debezium Server sinks link to their section of the Debezium Server page, and the anchor must be the section's real id, such as `debezium-server.html#debezium-server-amazon-kinesis-sink-configuration`. Guessed anchors such as `#_amazon_kinesis` load the page but land at the top.

A database that has both a source and a sink connector, such as Milvus, appears in both lists.

### Snapshot links: `playbook.yml` and `_scripts/create-snapshot-links.sh`

The documentation links to snapshot builds through attributes named `link-<id>-plugin-snapshot` in `playbook.yml`. Maven Central has no permanent "latest snapshot" link, so before every deployment `_scripts/create-snapshot-links.sh` looks up the current snapshot of each connector in its `CONNECTORS` list and rewrites that connector's attribute.

For a new connector, do both:

- add a `link-<id>-plugin-snapshot` attribute to `playbook.yml`, following the existing entries
- add the same `<id>` to `CONNECTORS` in the script.

A connector missing from the script keeps whatever link the playbook holds, which goes stale and breaks. That is how the Ingres, TiDB, Milvus and SQLite links ended up pointing at a retired Sonatype host until they were added.

## Retiring old series

Two flags in each `series.yml` control how prominent a series is:

- `displayed: true` shows the series in the main grids on `/releases/` and `/documentation/`, and in the version lists in the menus.
- `displayed: false` with `hidden: false` moves it into the "Show older series" section.
- `hidden: true` removes it from the release views entirely.

When a series is no longer actively maintained, set `displayed: false`. When it is no longer relevant at all, also set `hidden: true`. Keep the branches in `playbook.yml` in step with the series that are still shown: documentation is only built for the branches listed there.

## The Antora playbooks

The reference documentation is built by Antora from the main Debezium repository before Jekyll runs. Two playbooks control it:

- `playbook.yml` is used for normal builds and fetches the Debezium repository from GitHub.
- `playbook_author.yml` builds from a local checkout, for previewing documentation changes.

Keep their `asciidoc.attributes` in sync. The only intended differences are the content source (a GitHub URL against a local path) and that the author playbook has no analytics key.

### Which documentation versions are built

The `content` section of `playbook.yml` decides which branches or tags of the Debezium repository are built. Each listed branch becomes a documentation version, so the list should cover every series still shown on the site:

```yaml
content:
  sources:
    - url: https://github.com/debezium/debezium.git
      start_path: documentation
      branches:
        - '3.7'
        - '3.8'
        - 'main'
```

Tags can be used alongside branches, or instead of them:

```yaml
content:
  sources:
    - url: https://github.com/debezium/debezium.git
      start_path: documentation
      branches:
        - 'main'
      tags:
        - 'v3.7.0.Final'
```

Write the repository URL as `https://github.com/...`, not `https://www.github.com/...`. The Git library Antora uses mishandles the `www` form, and Antora then fails to fetch the repository.

### Which version is "stable" and "devel"

Two attributes in both playbooks decide how versions are labelled:

- `page-version-current` is the latest stable series. Its documentation is also published at `/documentation/reference/stable/`, and it shows the "current" banner. Older versions show the "outdated" banner and newer ones the "development" banner.
- `page-version-devel` is the series under development. Its documentation is also published at `/documentation/reference/devel/`.

Update both whenever a `.0.Final` is released, as described in [The Final release of a series](#the-final-release-of-a-series).

For running Antora by hand, see [ANTORA.md](./ANTORA.md).

## Checking your work

Build the site locally (see [README.md](./README.md)) and check:

- **Homepage:** the Releases section shows the right latest stable and development releases, and the cards link to the release notes and announcement.
- **`/releases/`:** the new release appears under its series, the badges are right, and the summary reads well within three lines.
- **`/releases/<series>/`:** the release is listed with its downloads. Open the downloads list and check a link or two, especially for new connectors.
- **`/releases/<series>/release-notes.html`:** the new section appears at the top and in the "On this page" sidebar.
- **`/documentation/` and the Learn and Releases menus:** the series labels are right.
- **`/databases/`:** new connectors appear, no card unexpectedly says "Not covered by the test matrix", and new documentation links work.
- **The documentation navigation bar:** after a build, the version badges in the Learn and Releases menus of the documentation match the rest of the site.

A full rebuild takes a while. If a page still looks old right after a change, wait for the build to finish before concluding that the change did not work.

## Reference: release data files

### `_data/releases/<series>/series.yml`

```yaml
summary: Version 3.8 release stream
version: "3.8"
overview: Short, plain-language description of the series.
displayed: true
hidden: false
connectors:
  - mysql
  - postgres
  # ...every connector shipped in every release of the series
compatibility:
  java:
    version: 17+ for connectors; 21+ for Debezium Server
  connect:
    version: 3.1 and later
  mysql:
    database:
      versions:
        - 8.0.x
        - 8.4.x
    driver:
      versions:
        - 9.1.0
  postgresql:
    database:
      versions:
        - 17
        - 18
      plugins:
        - decoderbufs
        - pgoutput
    driver:
      versions:
        - 42.7.13
  cassandra-3:
    note: No longer supported
```

- Runtime entries such as `java` and `connect` take a single `version` string.
- Connector entries take `database` and `driver`, each with a `versions` list. Some take extra attributes, such as PostgreSQL's `plugins` or Oracle's `olr`. The attributes the site knows how to display are listed under `test_attributes:` in `_config.yml`.
- A `note` records why an entry no longer has versions.

### `_data/releases/<series>/<version>.yml`

```yaml
date: 2026-12-17
version: "3.8.0.Final"
stable: true
summary: "One or two plain-language sentences on the highlights."
announcement_url: /blog/2026/12/17/debezium-3-8-final-released/
connectors:         # optional: connectors that first ship in this release
  - newconnector
compatibility:      # optional: tested versions that differ from series.yml
  cassandra-5:
    database:
      versions:
        - 5.0.8
```

### Other files touched by releases

| File | When to change it |
|---|---|
| `_data/versions.yml` | A new series starts |
| `releases/<series>/index.asciidoc` | A new series starts |
| `releases/<series>/release-notes.asciidoc` | Every release |
| `_data/connectors.yml` | A new connector plug-in ships |
| `_data/databases.yml` | A source or sink is added, graduates, or gets its documentation |
| `_config.yml` (`integrations`, `test_attributes`) | A new test matrix entry or attribute appears |
| `playbook.yml`, `playbook_author.yml` | A `.0.Final` release, a new series branch, or a new connector's snapshot link |
| `_scripts/create-snapshot-links.sh` | A new connector plug-in ships |
| `_antora/supplemental_ui/partials/dbz-navbar.hbs` | Never edited by hand; regenerated by every build. Optionally refresh the committed copy with `rake antora_nav` |
| `roadmap.asciidoc` | Optionally, after a `.0.Final` |

## Pitfalls

- **The newest release is found by sorting names as text.** The site and the navbar generator sort a series' release files by name and take the last one before `series.yml`. Alpha, Beta, CR and Final sort correctly that way, but a two-digit patch release would not: `3.8.10.Final` sorts before `3.8.2.Final`. No series has reached that yet. If one does, the sorting in `_includes/dbz/release-context.html`, the series card includes, the releases and documentation layouts, and `antora_nav_versions` in the `Rakefile` must be changed to compare versions numerically.
- **Jekyll strips dots from data directory and file names.** In templates, series `3.8` is `site.data.releases["38"]` and release `3.8.0.Final` is keyed `380Final`. This matters only when editing templates, not when adding data.
- **YAML needs version numbers quoted.** Unquoted, `3.10` becomes the number `3.1`. Always quote `version:` values and series numbers.
- **`_config.yml` is not reloaded while the local server runs.** After changing it, restart the server before checking the result.
