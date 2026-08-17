module Jekyll
  # Generates a page per author at /blog/author/<id>/, listing that author's
  # posts newest first.
  #
  # Unlike TagPageGenerator next door, the directory is the *downcased* id, and
  # everything linking here downcases too (see _includes/dbz/author-link.html).
  # That plugin uses the raw tag name, which is why "tag/UI/" exists and why
  # links to it have to be URL escaped rather than slugified - a mismatch that
  # broke nine tag links. Author ids have the same hazard: `StreamNative` and
  # `SeanRooooney` are mixed case. One transform, applied in both places, is the
  # cheapest way to make them unable to disagree.
  #
  # Four posts credit more than one author as a comma separated list, with
  # inconsistent spacing ("hpgrahsl,gmorling" but "jiazhai, StreamNative"), so
  # the value is split and stripped rather than read as a single id.
  class AuthorPageGenerator < Generator
    safe true

    def generate(site)
      by_author = {}

      site.posts.docs.each do |post|
        Jekyll.author_ids(post.data['author']).each do |id|
          (by_author[id] ||= []) << post
        end
      end

      by_author.each do |id, posts|
        # site.posts.docs is oldest first; the listing wants newest first.
        ordered = posts.sort_by { |p| p.data['date'] }.reverse
        site.pages << AuthorPage.new(site, site.source, id, ordered)
      end
    end
  end

  # Splits an `author:` front matter value into downcased ids.
  def self.author_ids(value)
    return [] if value.nil?
    value.to_s.split(',').map { |id| id.strip.downcase }.reject(&:empty?)
  end

  class AuthorPage < Page
    def initialize(site, base, id, posts)
      @site = site
      @base = base
      @dir  = File.join('blog', 'author', id)
      @name = 'index.html'

      self.process(@name)

      # Handed to Jekyll as a layout rather than read in as content - see the
      # long note in tags.rb for why read_yaml'ing a layout leaves the page
      # reporting the wrong `page.layout`.
      #
      # `data` has to be initialised explicitly here. Jekyll::Page only creates
      # the hash as a side effect of read_yaml, which tags.rb calls before
      # overwriting what it loaded. Skipping read_yaml avoids inheriting the
      # layout's front matter, but it also means nothing has set up `data`, so
      # the first `data['...'] =` raises NoMethodError on nil.
      self.content = ''
      self.data = {}
      self.data['layout'] = 'author'

      self.data['author_id'] = id
      self.data['posts'] = posts

      # authors.yaml is keyed by the id as written in front matter, which is not
      # always lowercase, so the lookup has to be case insensitive too. An id
      # with no entry at all (StreamNative, credited on the Pulsar post) falls
      # back to the raw id so the page still has a usable title.
      authors = site.data['authors'] || {}
      key = authors.keys.find { |k| k.to_s.downcase == id }
      entry = key ? authors[key] : nil

      self.data['author_entry'] = entry
      name = (entry && entry['name']) || id
      self.data['author_name'] = name
      self.data['title'] = name
      self.data['description'] = "Posts written by #{name} on the Debezium blog."
    end
  end
end
