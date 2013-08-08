##
#
# Awestruct::Extensions:Symlinker is a classic type of awestruct extension.
# If configured in project pipeline and site.yml, it will create a symlink from and to a given location.
#
# Configuration:
#
# 1. configure the extension in the project pipeline.rb:
#    - add symlinker dependency:
#
#      require 'symlinker'
#
#    - put the extension initialization in the initialization itself:
#
#      extension Awestruct::Extensions::Symlinker.new
#
# 2. In your site.yml add:
#
#    symlinker:
#      from: <source_path>
#      to: <destination_path>
#
#    This setting is optional and defaults to enabled.
#
##
require 'rbconfig'

module Awestruct
  module Extensions
    class Symlinker

      def execute(site)

      	# Checking if symlinker is configured, if not we do nothing.
      	if site.symlinker.nil?
      		return
      	end

      	# Checking whether a correct configuration is provided.
        if site.symlinker['from'].nil? or site.symlinker['to'].nil?
          print "Symlinker extension is not properly configured in site.yml.\n"
          return
        end

        from = site.symlinker['from']
        to = site.symlinker['to']

        if File.symlink?(to)
          print "Symlink from #{from} to #{to} already exists.\n"
        else
          begin
            File.symlink(from,to)
            print "Symbolic link from #{from} to #{to} has been created.\n"
          rescue
            print "Symbolic link could not be created due to an unsupported OS.\n"
          end
        end

      end

    end
  end
end
