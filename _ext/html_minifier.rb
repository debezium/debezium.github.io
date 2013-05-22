require 'htmlcompressor'

##
#
# Awestruct::Extensions:HtmlMinifier is a transformer type of awestruct extension.
# If configured in project pipeline and site.yml, it will compress HTML files.
#
# Required installed gems:
# - html_press
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add html_minifier dependency:
#
#      require 'html_minifier'
#
#    - put the extension initialization in the initialization itself:
#
#      transformer Awestruct::Extensions::HtmlMinifier.new
#
# 2. In your site.yml add:
#
#    html_minifier: enabled
#
#    This setting is optional and defaults to 'enabled', it's useful when using different configurations
#    for different runtime profiles.
#
##
module Awestruct
  module Extensions
    class HtmlMinifier

      def transform(site, page, input)

        # Checking if 'html_minifier' setting is provided and whether it's enabled.
        # By default, if it's not provided, we imply it's enabled.
        if !site.html_minifier.nil? && !site.html_minifier.to_s.eql?("enabled")
          return input
        end

        # Test if it's a HTML file.
        ext = File.extname(page.output_path)
        if !ext.empty?
          ext_txt = ext[1..-1]
          if ext_txt == "html"
            print "Minifying html #{page.output_path} \n"
            compressor = HtmlCompressor::Compressor.new
            input = compressor.compress(input)
          end
        end

        input
      end
    end
  end
end
