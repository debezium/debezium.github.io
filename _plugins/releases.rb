require 'net/http'
require 'uri'
require 'thread'

module Jekyll
  class Release

    def initialize()
      @count = 0
      @mutex = Mutex.new
      @max_threads = 40
    end

    def execute(site)
      threads = []
      releases = site.releases.dup
      request_count = releases.count * 4;
      start = Time.now
      puts "Starting release scan of #{releases.count} releases with up to #{request_count} reqs using #{@max_threads} connections/threads."
      group = releases.pop(@max_threads)
      while not group.nil? and group.count > 0
        (group).each do |release|
          threads << Thread.new {
            analyze_release(release)
          }
        end
        threads.each { |thr| thr.join }
        group = releases.pop(@max_threads)
        threads = []
      end
      duration = Time.now - start
      puts
      puts "Release scan completed in #{duration} seconds."
    end

    def analyze_release(release)
      version = release[:version]
      Net::HTTP.start("download.jboss.org") do |http|
        {:zip => '.zip',  :tgz => '.tar.gz', :srczip => '-src.zip', :srctgz => '-src.tar.gz'}.each do |kind, suffix|
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/wildfly-#{version}#{suffix}")
          release[kind] = {:url => uri, :size => compute_size(http,uri)}
        end
        {:zip => '.zip',  :tgz => '.tar.gz', :srczip => '-src.zip', :srctgz => '-src.tar.gz'}.each do |kind, suffix|
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/servlet/wildfly-web-#{version}#{suffix}")
          size = compute_size(http,uri)
          if (size != "unknown")
            release[:servlet] = {} unless release.has_key?(:servlet)
            release[:servlet][kind] = {:url => uri, :size => size}
          end
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/servlet/wildfly-servlet-#{version}#{suffix}")
          size = compute_size(http,uri)
          if (size != "unknown")
            release[:servlet] = {} unless release.has_key?(:servlet)
            release[:servlet][kind] = {:url => uri, :size => size}
          end
        end
        if release.has_key?("updateforversion")
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/wildfly-#{version}-update.zip")
          release[:update] = {:url => uri, :size => compute_size(http,uri)}
        end
        if release.has_key?("updateforversionfull")
          versionfull = release["updateforversionfull"]
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/wildfly-#{version}-#{versionfull}-update.zip")
          release[:updatefull] = {:url => uri, :size => compute_size(http,uri)}
        end
        if release.has_key?("quickversion")
          version = release[:quickversion] 
          uri = URI.parse("http://download.jboss.org/wildfly/#{version}/quickstart-#{version}.zip")
          release[:quickstart] = {:url => uri, :size => compute_size(http,uri)}
        end
      end
    end

    def compute_size(http, uri)
      response = http.head( uri.path )
      b = response['content-length'] || ''
      if ( response.code == "200" and ! b.empty? )
        print_wrap 'x'
        formatBytes(b)
      else
        print_wrap '.'
        'unknown'
      end
    end

    def print_wrap(char) 
      @mutex.synchronize {
        if (@count += 1) % @max_threads == 0
          puts char
        else
          print char
        end
      }
    end

    def formatBytes(bytes)
      bytes = bytes.to_f
      units = ["bytes", "KB", "MB", "GB", "TB", "PB"]

      i = 0
      while bytes > 1024 and i < 6 do
        bytes /= 1024
        i += 1
      end

      sprintf("%.0f %s", bytes, units[i])
    end  
  end
end