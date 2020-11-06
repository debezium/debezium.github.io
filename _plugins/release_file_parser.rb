require 'open-uri'
require 'uri'

module Jekyll
  # Awestruct extension which traverses the given directory to find release information.
  # The release information is then added to the site hash.
  #
  # An assumption is made that release files are YAML files in a directory subdirectory called 'releases'.
  #
  # The release information for a given release can then be accessed startinf from the top
  # level site hash via:
  #
  # site['versions'].['<release-version>'], e.g. site['versions'].['0.9.5.Final'].
  #
  # The release data itself is storede in the hash using the following keys:
  # version, version_family, date, stable, announcement_url, summary, and displayed
  class ReleaseFileParser

    def initialize(data_dir = "_data")
      @data_dir = data_dir
    end

    def watch(watched_dirs)
      watched_dirs << @data_dir
    end

    def execute(site)
      # Keep reference to the site
      @site = site

      # register the parent hash for all releases within the site
      @versions_hash = site[:versions]
      if @versions_hash == nil
        @versions_hash = Hash.new
        site[:versions] = @versions_hash
      end

      # traverse the file system to find the release files
      findReleaseFiles( site, "#{site.dir}/#{@data_dir}" )
    end

    def findReleaseFiles(site, dir)
      Dir[ "#{dir}/*"].each do |entry|
        if ( File.directory?( entry ) )
          if ( entry =~ /releases/ )

            releases_hash = site[:versions]

            release_series_hash = site[:release_series]
            if ( release_series_hash == nil )
              release_series_hash = Hash.new
              site[:release_series] = release_series_hash
            end

            populateReleaseHashes( entry, release_series_hash, releases_hash )

            sortReleaseHashes( releases_hash, release_series_hash )

          else
            findReleaseFiles( site, entry )
          end
        end
      end
    end

    def populateReleaseHashes(releases_dir, release_series_hash, release_hash)
      Dir.foreach(releases_dir) do |file_name|
        file = File.expand_path( file_name, releases_dir )
        if ( File.directory?( file ) )
          if ( file_name.start_with?( "." ) )
            next
          else
            # This directory represents a release series
            series = createSeries( file )
            release_series_hash[series.version] = series

            # Populate this series releases
            Dir.foreach(file) do |sub_file_name|
              sub_file = File.expand_path( sub_file_name, file )
              # Skip '.' and '..' and 'series.yml'
              if ( File.directory?( sub_file ) || File.basename( sub_file ) == "series.yml" )
                next
              else
                release = createRelease( sub_file, series )
                series.releases.push( release )
                release_hash[release.version] = release
              end
            end
          end
        end
      end
    end

    def createSeries(series_dir)
      series_file = File.expand_path( "./series.yml", series_dir )
      series = @site.engine.load_yaml( series_file )
      if ( series[:version] == nil )
        series[:version] = File.basename( series_dir )
      end
      series[:releases] = Array.new
      return series
    end

    def createRelease(release_file, series)
      unless ( release_file =~ /.*\.yml$/ )
        abort( "The release file #{release_file} does not have the YAML (.yml) extension!" )
      end

      release = @site.engine.load_yaml( release_file )

      if ( release[:version] == nil )
        File.basename( release_file ) =~ /^(.*)\.\w*$/
        release[:version] = $1
      end
      if ( series != nil )
        release[:version_family] = series.version
      end

      return release
    end

    def sortReleaseHashes( releases_hash, release_series_hash )
      unless release_series_hash == nil
        release_series_hash = Hash[release_series_hash.sort_by { |key,value| Version.new(key) }.reverse]

        found_series = false
        found_stable_series = false

        release_series_hash.each do |series_version, series|
          releases = series.releases
          releases = releases.sort_by { |release| Version.new(release.version) }.reverse
          series.releases = releases

          found_release = false
          found_stable_release = false
          releases.each do |release|
            release.latest = false
            release.latest_stable = false
            if !found_release
              found_release = true
              release.latest = true
              series[:latest_release] = release
            end
            if !found_stable_release && release.stable
              found_stable_release = true
              release.latest_stable = true
              series[:latest_stable_release] = release
            end
          end

          series.stable = series.releases.first.stable
          series.latest = false
          series.latest_stable = false

          if !found_series
            found_series = true
            series.latest = true
            @site[:latest_series] = series
          end

          if !found_stable_series && series.stable && series.displayed && !series.hidden
            found_stable_series = true
            series.latest_stable = true
            @site[:latest_stable_series] = series
          end
        end

        release_series_hash = Hash[release_series_hash.sort_by { |key,value| Version.new(key) }]
        @site[:release_series] = release_series_hash
      end
      unless releases_hash == nil
        releases_hash = Hash[releases_hash.sort_by { |key,value| Version.new(key) }.reverse]
        @site[:versions] = releases_hash
      end
    end

  end

  class Version
    include Comparable

    attr_reader :major, :feature_group, :feature, :bugfix

    def initialize(version="")
      v = version.to_s.split(".")
      @major = v[0].to_i
      @feature_group = v[1].to_i
      @feature = v[2].to_i
      @bugfix = v[3].to_s
    end

    def <=>(other)
      return @major <=> other.major if ((@major <=> other.major) != 0)
      return @feature_group <=> other.feature_group if ((@feature_group <=> other.feature_group) != 0)
      return @feature <=> other.feature if ((@feature <=> other.feature) != 0)
      return @bugfix <=> other.bugfix
    end

    def self.sort
      self.sort!{|a,b| a <=> b}
    end

    def to_s
      @major.to_s + "." + @feature_group.to_s + "." + @feature.to_s + "." + @bugfix.to_s
    end
  end
end