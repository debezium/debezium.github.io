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

        # Linux command for creating a symlink.
        command = "ln -s #{from} #{to}"

        if system(command)
          print "Symbolic link from #{from} to #{to} has been created.\n"
        else
          print "Creating symbolic link from #{from} to #{to} was unsuccessful.\n"
        end

      end

    end
  end
end
