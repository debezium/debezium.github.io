require 'cssminify'

##
#
# Awestruct::Extensions:CssMinifier is a transformer type of awestruct extension.
# If configured in project pipeline and site.yml, it will compress CSS files.
#
# Required installed gems:
# - cssminify
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add css_minifier dependency:
#
#      require 'css_minifier'
#
#    - put the extension initialization in the initialization itself:
#
#      transformer Awestruct::Extensions::CssMinifier.new
#
# 2. In your site.yml add:
#
#    css_minifier: enabled
#
#    This setting is optional and defaults to enabled.
#
##
module Awestruct
  module Extensions
    class CssMinifier

      def transform(site, page, input)

        # Checking if 'css_minifier' setting is provided and whether it's enabled.
        # By default, if it's not provided, we imply it's enabled.
        if !site.css_minifier.nil? and !site.css_minifier.to_s.eql?('enabled')
          return input
        end

        output = ''

        # Test if it's a CSS file.
        ext = File.extname(page.output_path)
        
        # skip if the file has no extension
        if ext.empty?
          return input
        end
        
        ext_txt = ext[1..-1]

        # Filtering out non-css files and those which were already minimized with added suffix.
        if ext_txt == "css" and !page.output_path.to_s.end_with?("min.css")
          print "Minifying css #{page.output_path} \n"
          output = CSSminify.compress(input)
        else
          return input
        end

        oldFileName = File.basename(page.output_path).to_s

        # Create new file name with suffix added
        newFileName = oldFileName.slice(0..oldFileName.length-4)+"min.css"
        newOutputPath = File.join(File.dirname(page.output_path.to_s),newFileName)

        # Create a temporary file with the merged content.
        tmpOutputPath = File.join( "./_tmp/" , newFileName)
        tmpOutputFile = File.new(tmpOutputPath,"w")
        tmpOutputFile.write(output)
        tmpOutputFile.close

        # Add the temporary file to the list of pages for rendering phase.
        newPage = site.engine.load_page(tmpOutputPath)
        newPage.source_path = tmpOutputPath
        newPage.output_path = newOutputPath
        site.pages << newPage

        # We return the input because we leave the original file untouched
        input
      end
    end
  end
end
