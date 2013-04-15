##
#
# Awestruct::Extensions:WgetWrapper is a classic type of awestruct extension.
# If configured in project pipeline and site.yml, it will download content from listed URLs.
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add wget_wrapper dependency:
#
#      require 'wget_wrapper'
#
#    - put the extension initialization in the initialization itself:
#
#      extension Awestruct::Extensions::WgetWrapper.new
#
# 2. This is an example site.yml configuration:
#
#    wget:
#      enabled: true
#      createGitIgnoreFiles: true
#      urls:
#        - http://static.jboss.org/theme/css/bootstrap-community.js
#        - http://static.jboss.org/theme/js/bootstrap-community.js
#        - http://static.jboss.org/theme/fonts/titilliumtext/
#        - http://static.jboss.org/theme/images/common/
#
#   Note: 'enabled' and 'createGitIgnoreFiles' properties default to 'true' if not defined.
#
##

require 'uri'

module Awestruct
  module Extensions
    class WgetWrapper

      def execute(site)

        # Checking whether a correct configuration is provided
        if site.wget.nil? or site.wget['urls'].nil?
          print "WgetWrapper extension is not properly configured in site.yml.\n"
          return
        end

        # Checking if it's enabled(default)
        if !site.wget['enabled'].nil? and !( site.wget['enabled'].to_s.eql?("true") )
          return
        end

        # Checking whether .gitignore files should be created (default)
        createGitIgnoreFiles = true
        if !site.wget['createGitIgnoreFiles'].nil? and !( site.wget['createGitIgnoreFiles'].to_s.eql?("true") )
          createGitIgnoreFiles = false
        end

        command = "wget "


        
        noHostDirectories = false
        directoryPrefix = ""

        # Getting 'options' from configuration
        options = site.wget['options']
        optionsStr = ''
        if !options.nil?

          options.each do |option|

            opStr = option.to_s.strip

            # Checking if -nH or --no-host-directories was specified.
            if (opStr.eql?("-nH") or opStr.eql?("--no-host-directories"))
              noHostDirectories = true
            end

            # Checking if -P or --directory-prefix was specified.
            if (opStr.start_with?("-P") or opStr.start_with?("--directory-prefix"))
              directoryPrefix = opStr.split(/=|\s/,2)[1].strip
            end

            command += " "+opStr
          end

        end

        # Getting urls from site.yml
        urls = site.wget['urls']

        # Paths for .gitignore files
        directories = Array.new

        # If there is directory prefix defined then we know where should we search for downloaded files.
        if (createGitIgnoreFiles and !directoryPrefix.eql?(""))
          directories.push(directoryPrefix)
        end

        # Iterate over each defined url, add up all of them and collect root paths for .gitignore files.
        urlsStr = ''
        urls.each do |url|
          urlsStr += " "+url.to_s

          if (createGitIgnoreFiles and directoryPrefix.eql?(""))

            uri = URI(url)

            transformedPath=""
            # If --no-host-directories or -nH option was specified for wget.
            if (noHostDirectories)
              path = uri.path
              splitPath = path.to_s.split("/")
              next if splitPath.size == 0
              transformedPath=splitPath[1].to_s
            else
              transformedPath=uri.host+uri.path
            end

            if (!directories.include?(transformedPath))
              directories.push(transformedPath)
            end
          end

        end

        command += urlsStr

        print "Downloading content...\n"

        if system(command)
          print "Content downloaded.\n"
        else
          print "At least some of content from specified URLs was not reachable.\n"
        end

        # Iterate over collected root directories of downloaded files.
        directories.each do |directory|

          dirPath = File.join(".",directory)

          # Checking if the directory itself exists, if not it means that probably wget failed to download it.
          if (!File.exist?(dirPath) or !File.directory?dirPath)
            next
          end

          createGitIgnoreFile(dirPath) if createGitIgnoreFiles

          # Collect all pages' paths that are already scheduled for rendering.
          pathnames = Array.new
          site.pages.each { |page| pathnames.push( page.output_path ) }

          addToRenderedPages( Pathname.new(dirPath) , site , pathnames )

        end

      end


      # Create .gitignore file if it's not already there.
      def createGitIgnoreFile ( directoryPath )

        gitIgnoreFilePath = File.join(directoryPath,".gitignore")

        # Checking if .gitignore file already exists
        if (File.exist?(gitIgnoreFilePath))
          return
        end

        gitIgnoreFile = File.new( gitIgnoreFilePath , "w" )
        gitIgnoreFile.write("*\n")
        gitIgnoreFile.close

      end


      # Add all files inside a directory to rendered pages list.
      def addToRenderedPages ( directory , site , pathnames )

        # Iteration through files and directories inside the directory.
        directory.children.collect do |entry|

          # If an entry is a non-hidden directory we process its content by a recursive call.
          if entry.directory? and !entry.basename.to_s.start_with?('.')
            addToRenderedPages( entry , site , pathnames )
            next
          end

          # Removing '.' from the beginning of the path.
          noDotPath = entry.to_s.slice(1..entry.to_s.length-1)

          # Searching if files are already scheduled for rendering
          found = false
          pathnames.each { |path| if path.end_with?(noDotPath) then found=true ; break; end }

          # Depending whether it's a scheduled file or start with a '.', we skip to the next iteration.
          next if found or entry.basename.to_s.start_with?('.')

          # Adding file to rendered pages.
          pathnames.push(noDotPath)
          page = site.engine.load_page(entry.to_s)
          page.source_path = entry.to_s
          page.output_path = entry.to_s
          site.pages << page

        end

      end

    end
  end
end
