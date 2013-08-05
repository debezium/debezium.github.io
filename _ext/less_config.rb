##
#
# Awestruct::Extensions:LessConfig is a classic type of awestruct extension.
# If configured in the project pipeline and site.yml it will configure
# the jborg_fonts_path and jborg_images_path Less variables based on site properties.
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add compass_config dependency:
#
#      require 'less_config'
#
#    - put the extension initialization in the initialization itself:
#
#      extension Awestruct::Extensions::LessConfig.new
#
# 2. This is an example site.yml configuration:
#
#    jborg_fonts_url: http://static.jboss.org/theme/fonts
#    jborg_images_url: http://static.jboss.org/theme/images
#
##
module Awestruct
  module Extensions
    class LessConfig

      def execute(site)
        output = ''
        if !site.jborg_fonts_url.nil?
          output+= "@jborg_fonts_url: \"" + site.jborg_fonts_url + "\";\n"
        end
        if !site.jborg_images_url.nil?
          output+= "@jborg_images_url: \"" + File.join(site.jborg_images_url , "common") + "\" ;\n"
        end

        # Create a temporary file with the merged content.
        tmpOutputPath = File.join( site.config.stylesheets_dir , "_config-variables.less")
        tmpOutputFile = File.new(tmpOutputPath,"w")
        tmpOutputFile.write(output)
        tmpOutputFile.close

      end

    end
  end
end
