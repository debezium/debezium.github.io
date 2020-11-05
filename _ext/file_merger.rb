##
#
# Awestruct::Extensions:FileMerger is a classic type of awestruct extension.
# If configured in project pipeline and site.yml, it will merge listed files into one.
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add file_merger dependency:
#
#      require 'file_merger'
#
#    - put the extension initialization in the initialization itself:
#
#      extension Awestruct::Extensions::FileMerger.new
#
# 2. This is an example site.yml configuration:
#
#    fileMerger:
#      enabled: true
#      outputFilePath: /javascripts/javascript.min.js
#      paths:
#        - /javascripts/jquery.js
#        - /javascripts/prettify.js
#        - /javascripts/bootstrap-transition.js
#        - /javascripts/bootstrap-alert.js
#
##

module Awestruct
  module Extensions
    class FileMerger

      def execute(site)

        # Checking whether a correct configuration is provided
        if site.fileMerger.nil? or site.fileMerger['paths'].nil? or site.fileMerger['outputFilePath'].nil?
          print "FileMerger extension is not properly configured in site.yml.\n"
          return
        end

        # Checking if it's enabled(default)
        if !site.fileMerger['enabled'].nil? and !( site.fileMerger['enabled'].to_s.eql?("true") )
          return
        end

        # Reading site.yml parameters
        paths = site.fileMerger['paths']
        outputPath = site.fileMerger['outputFilePath']

        # Iterate over each defined file and add up all content in 'output' variable
        output = ''
        paths.each do |path|
          inputFile = File.new(path.to_s.start_with?(".") ? path : ("."+path.to_s))
          inputFile.each { |line| output += line }
          output += "\n"
        end

        # Create a temporary file with the merged content.
        tmpOutputPath = File.join( "./_tmp/" , File.basename(outputPath))
        tmpOutputFile = File.new(tmpOutputPath,"w")
        tmpOutputFile.write(output)
        tmpOutputFile.close

        # Add the temporary file to the list of pages for rendering phase.
        page = site.engine.load_page(tmpOutputPath)
        page.source_path = tmpOutputPath
        page.output_path = outputPath
        site.pages << page

      end

    end
  end
end
