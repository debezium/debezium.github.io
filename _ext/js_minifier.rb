require 'uglifier'

##
#
# Awestruct::Extensions:JsMinifier is a transformer type of awestruct extension.
# If configured in project pipeline and site.yml, it will compress javascript files.
#
# Required installed gems:
# - uglifier (this has a runtime dependency on execjs)
# - therubyracer
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add js_minifier dependency:
#
#      require 'js_minifier'
#
#    - put the extension initialization in the initialization itself:
#
#      transformer Awestruct::Extensions::JsMinifier.new
#
# 2. In your site.yml add:
#
#    js_minifier: enabled
#
#    This setting is optional and defaults to enabled.
#
##
module Awestruct
  module Extensions
    class JsMinifier

      def transform(site, page, input)

        # Checking if 'js_minifier' setting is provided and whether it's enabled.
        # By default, if it's not provided, we imply it's enabled.
        if !site.js_minifier.nil? and !site.js_minifier.to_s.eql?('enabled')
          return input
        end

        output = ''

        ext = File.extname(page.output_path)
        # skip if the file has no extension
        if ext.empty?
          return input
        end

        ext_txt = ext[1..-1]

        # Filtering out non-js files and those which were already minimized with added suffix.
        if ext_txt == "js" and !page.output_path.to_s.end_with?("min.js")
          print "Minifying javascript #{page.output_path} \n"
          output = Uglifier.new.compile(input)
        else
          return input
        end

        oldFileName = File.basename(page.output_path).to_s

        # Create new file name with suffix added
        newFileName = oldFileName.slice(0..oldFileName.length-3)+"min.js"
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
