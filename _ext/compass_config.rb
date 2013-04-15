##
#
# Awestruct::Extensions:CompassConfig is a classic type of awestruct extension.
# If configured in the project pipeline and site.yml it will configure the http_fonts_path and http_images_path Compass properties based on site properties.
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add compass_config dependency:
#
#      require 'compass_config'
#
#    - put the extension initialization in the initialization itself:
#
#      extension Awestruct::Extensions::CompassConfig.new
#
# 2. This is an example site.yml configuration:
#
#    jborg_fonts_url: http://static.jboss.org/theme/fonts
#    jborg_images_url: http://static.jboss.org/theme/images	
#
##
module Awestruct
  module Extensions
    class CompassConfig
			
      def execute(site)
        if !site.jborg_fonts_url.nil?
          Compass.configuration.http_fonts_path = site.jborg_fonts_url
        end
        if !site.jborg_images_url.nil?
          Compass.configuration.http_images_path = site.jborg_images_url + "/common"
        end
      end
			
    end
  end
end
