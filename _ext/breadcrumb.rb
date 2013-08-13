module Awestruct
  module Extensions
    module Breadcrumb

      def breadcrumb(path)

        return nil if !path or path.eql?("/") or path.eql?("index.html")

        output = ""
        index = -1
        while index=path.index("/",index+1)

          parent_path = path[0..index] + "index.html"
          if page=findInPages(parent_path)
            output += generateAnchorHtml(page)
            next
          end

          parent_path = path[0..index-1] + ".html"
          if page=findInPages(parent_path)
            output += generateAnchorHtml(page)
            next
          end

        end

        if !parent_path.eql?(path)
          output += generateAnchorHtml(findInPages(path))
        end

        # Returning output content without trailing arrow and wrapped in a div.
        output = "<div class='breadcrumb'>" + output[0..output.length-4] + "</div>"
      end


      def findInPages(path)

        for page in site.pages
          if page.output_path.eql?(path)
            return page
          end
        end

      end

      def generateAnchorHtml(page)

        page = page.real_page if page.real_page != nil

        path = page.output_path == nil ? page.url : page.output_path

        return "" if path==nil

        "<a class='breadcrumb_anchor' href='#{site.base_url}#{page.output_path}'
        >#{page.title ? page.title : page.simple_name.capitalize }</a> / "

      end

    end
  end
end