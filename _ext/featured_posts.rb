
module Awestruct
  module Extensions

    # Awestruct extension which traverses all content in the path prefix, typically '/blog' for all blogs
    # and any blog entry that contains the tag `featured` will be added to a collection that can then be
    # used to render a list of featured blog posts in the UI
    #
    # The collection can be referenced by accessing `site.featured_posts`.
    #
    class FeaturedPosts

      attr_accessor :path_prefix

      def initialize(path_prefix='')
        @path_prefix = path_prefix
      end

      def execute(site)
        featured = []

        site.pages.each do |page|
          year, month, day, slug = nil
          if ( page.relative_source_path =~ /^#{@path_prefix}\// )
            if !page.tags.nil? && !page.tags.empty?
              page.tags.each do |tag|
                if tag == "featured"
                  featured << page
                end
              end
            end
          end
        end

        # Sort the blog posts most recent to oldest
        featured = featured.sort_by{|each| [each.date, each.sequence || 0, File.mtime( each.source_path ), each.slug ]}

        site[:featured_posts] = featured
      end

    end
  end
end

