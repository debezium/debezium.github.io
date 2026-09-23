module Jekyll
  # Generates a page per tag at /tag/<tag>/.
  #
  # The tag name is used verbatim as the directory, so tags containing spaces
  # or capitals produce directories to match ("tag/apache kafka/", "tag/UI/").
  # Anything linking to a tag page must therefore use the raw name, URL
  # escaped, rather than slugifying it.
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.to_set
      tags.each do |tag|
        site.pages << TagPage.new(site, site.source, tag)
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base
      @dir  = File.join('tag', tag)
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')

      # read_yaml above loads _layouts/tag.html as this page's *content*, which
      # also copies that file's front matter - including `layout: base` - into
      # this page's data. The page therefore reported `page.layout == "base"`,
      # which is wrong for anything that keys off the layout name. It broke the
      # `design_v2_layouts` check in _layouts/base.html, so every tag page
      # silently rendered with the old chrome.
      #
      # Instead, hand tag.html to Jekyll as a layout, the way it is used
      # everywhere else: blank the content and point the page at it. Jekyll then
      # renders empty content into tag.html, and tag.html's own front matter
      # wraps that in base. Same output, correct `page.layout`.
      self.content = ''
      self.data['layout'] = 'tag'

      self.data['tag'] = tag
      self.data['title'] = "Tag: #{tag}"
    end
  end
end
