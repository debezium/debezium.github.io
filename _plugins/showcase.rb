require 'yaml'
require 'date'
require 'cgi'

module Jekyll
  # Debezium Community Showcase.
  #
  # The showcase lives in _showcase/ as a small Marp project: each episode is an
  # AsciiDoc-free Markdown deck under _showcase/deck/src/episodes/<nnn>/index.md
  # whose front-matter-like metadata sits in a ```episode fenced block, with the
  # intro copy in _showcase/deck/src/showcase/intro.yml. Speakers are NOT defined
  # in the deck; an episode session's `nick` is an author id from the site-wide
  # blog directory _data/authors.yaml (both this generator and the Marp engine
  # read it, so a speaker's name/bio/avatar live in one place). The Rakefile runs
  # the Marp build and publishes the decks under community/showcase (see
  # build_showcase).
  #
  # The episode-list landing page at /community/showcase/, however, is rendered
  # natively by Jekyll (_layouts/showcase.html) so it carries the site nav,
  # footer and light/dark theme. To avoid a second copy of the episode list, this
  # generator parses the very same Marp sources the slides are built from and
  # exposes them as site.data['showcase']. One source of truth, two renderers.
  #
  # _showcase/ is excluded from Jekyll processing in _config.yml; a plugin can
  # still read those files straight off disk, which is what we do here.
  class ShowcaseGenerator < Generator
    safe true
    priority :normal

    SRC = '_showcase/deck/src'.freeze

    def generate(site)
      root = File.join(site.source, SRC)
      return unless File.directory?(root)

      # Speakers are resolved against the site-wide blog author directory
      # (_data/authors.yaml), the same source the blog uses, so a showcase
      # speaker's photo (avatar), name and bio stay in one place. Each episode
      # session's `nick` must therefore be an author id from that file.
      authors = site.data['authors'] || {}
      intro   = load_intro(File.join(root, 'showcase/intro.yml'))
      episodes = load_episodes(File.join(root, 'episodes'), authors)

      site.data['showcase'] = {
        'intro'    => intro,
        'episodes' => episodes
      }
    end

    private

    def load_intro(path)
      return {} unless File.file?(path)
      intro = YAML.load_file(path) || {}
      # Pre-render the intro copy: split on blank lines into paragraphs and turn
      # [text](url) into links, mirroring mdLinks() in the Marp engine.
      text = intro['text'].to_s
      intro['paragraphs'] = text.split(/\n\s*\n/).map { |p| md_links(p.strip) }.reject(&:empty?)
      intro
    end

    def md_links(text)
      escaped = CGI.escapeHTML(text)
      escaped.gsub(/\[([^\]]+)\]\(([^)]+)\)/) do
        %(<a href="#{$2}">#{$1}</a>)
      end
    end

    def load_episodes(dir, authors)
      return [] unless File.directory?(dir)

      episodes = Dir.children(dir)
        .select { |name| File.directory?(File.join(dir, name)) }
        .sort
        .reverse # newest episode number first
        .map { |name| parse_episode(File.join(dir, name, 'index.md'), name, authors) }
        .compact

      # Draft episodes are built as slides but never listed on the landing page,
      # matching the behaviour of the original standalone index generator.
      episodes.reject { |ep| ep['draft'] }
    end

    def parse_episode(path, dir_name, authors)
      return nil unless File.file?(path)
      content = File.read(path)
      m = content.match(/```episode\n(.*?)```/m)
      return nil unless m

      ep = { 'sessions' => [], 'dir' => dir_name }
      m[1].strip.each_line do |line|
        line = line.rstrip
        if (s = line.match(/^(light|regular|special):\s*(\w+)\s*\|\s*(.+)$/))
          author = authors[s[2]]
          ep['sessions'] << {
            'type'   => s[1],
            'nick'   => s[2],
            'talk'   => s[3].strip,
            'author' => author,
            'bio'    => short_bio(author && author['bio'])
          }
        elsif (kv = line.match(/^(\w+):\s*(.+)$/))
          ep[kv[1]] = kv[2].strip
        end
      end

      ep['draft']        = ep['draft'].to_s == 'true'
      ep['upcoming']     = upcoming?(ep)
      ep['display_date'] = display_date(ep)
      ep
    end

    # Author bios (shared with the blog) can run long. Cap the showcase subtitle
    # near 145 characters, ending on a sentence boundary: the last period at or
    # before 145, or - when the first sentence alone is longer than that - the
    # first period after 145. Kept in step with truncateBio() in the Marp
    # engine.mjs so slides and the landing trim identically.
    BIO_LIMIT = 145

    def short_bio(bio)
      return nil if bio.nil?
      return bio if bio.length <= BIO_LIMIT
      idx = bio.rindex('.', BIO_LIMIT) || bio.index('.', BIO_LIMIT)
      idx ? bio[0..idx] : bio
    end

    # Reproduces formatDate(): "October 2026" + day 27 -> "October 27, 2026".
    def display_date(ep)
      date = ep['date'].to_s
      return date unless ep['day']
      year = date[/\d{4}/]
      month = date.sub(/\d{4}/, '').strip
      "#{month} #{ep['day']}, #{year}"
    end

    # Reproduces isUpcoming(): true when the episode date is in the future.
    def upcoming?(ep)
      md = ep['date'].to_s.match(/^(\w+)\s+(\d{4})$/)
      return false unless md
      day = ep['day'] || '1'
      begin
        parsed = Date.parse("#{md[1]} #{day}, #{md[2]}")
      rescue ArgumentError
        return false
      end
      parsed > Date.today
    end
  end
end
