# This file is a rake build file. The purpose of this file is to simplify
# setting up and using Awestruct. It's not required to use Awestruct, though it
# does save you time (hopefully). If you don't want to use rake, just ignore or
# delete this file.
#
# If you're just getting started, execute this command to install Awestruct and
# the libraries on which it depends:
#
#  rake setup
#
# The setup task installs the necessary libraries according to which Ruby
# environment you are using. If you want the libraries kept inside the project,
# execute this command instead:
#
#  rake setup[local]
#
# IMPORTANT: To install gems, you'll need development tools on your machine,
# which include a C compiler, the Ruby development libraries and some other
# development libraries as well.
#
# There are also tasks for running Awestruct. The build will auto-detect
# whether you are using Bundler and, if you are, wrap calls to awestruct in
# `bundle exec`.
#
# To run in Awestruct in development mode, execute:
#
#  rake
#
# To clean the generated site before you build, execute:
#
#  rake clean preview
#
# To deploy using the production profile, execute:
#
#  rake deploy
#
# To get a list of all tasks, execute:
#
#  rake -T
#
# Now you're Awestruct with rake!

$use_bundle_exec = true
$install_gems = ['awestruct -v "~> 0.5.0"', 'rb-inotify -v "~> 0.9.0"']
$awestruct_cmd = nil
task :default => :preview

desc 'Setup the environment to run Awestruct'
task :setup, [:env] => :init do |task, args|
  next if !which('awestruct').nil?

  if File.exist? 'Gemfile'
    require 'fileutils'
    FileUtils.remove_file 'Gemfile.lock', true
    FileUtils.remove_dir '.bundle', true
    system 'bundle install --binstubs=_bin --path=.bundle'
  else
    if args[:env] == 'local'
      $install_gems.each do |gem|
        msg "Installing #{gem}..."
        system "gem install --bindir=_bin --install-dir=.bundle #{gem}"
      end
    else
      $install_gems.each do |gem|
        msg "Installing #{gem}..."
        system "gem install #{gem}"
      end
    end
  end
  msg 'Run awestruct using `awestruct` or `rake`'
  # Don't execute any more tasks, need to reset env
  exit 0
end

desc 'Update the environment to run Awestruct'
task :update => :init do
  if File.exist? 'Gemfile'
    system 'bundle update'
  else
    system 'gem update awestruct'
  end
  # Don't execute any more tasks, need to reset env
  exit 0
end

desc 'Build and preview the site locally in development mode'
task :preview => :check do
  run_awestruct '-d'
end

desc 'Generate the site using the development profile'
task :gen => :check do
  run_awestruct '-P development -g --force'
end

desc 'Push local commits to origin/master'
task :push do
  system 'git push origin master'
end

#desc 'Generate the site and deploy to production'
# TODO: This will need to be tweaked a bit for our site, we may need to shell out to a system command
#task :deploy => [:check, :push] do
  #run_awestruct '-P production -g --force --deploy'
#end

#desc 'Generate site from Travis CI and, if not a pull request, publish site to production (GitHub Pages)'
#task :travis => :check do
  ## if this is a pull request, do a simple build of the site and stop
  #if ENV['TRAVIS_PULL_REQUEST'] == '1' || ENV['TRAVIS_PULL_REQUEST'] == 'true'
    #run_awestruct '-P production -g'
    #next
  #end

  #require 'yaml'

  ## TODO use the Git library for these commands rather than system
  #repo = %x(git config remote.origin.url).gsub(/^git:/, 'https:')
  #system "git remote set-url --push origin #{repo}"
  #system 'git remote set-branches --add origin master'
  #system 'git fetch -q'
  ##git_user = YAML.load_file('_config/git.yml')
  ##system "git config user.name '#{git_user['name']}'"
  ##system "git config user.email '#{git_user['email']}'"
  #system "git config user.name '#{ENV['GIT_NAME']}'"
  #system "git config user.email '#{ENV['GIT_EMAIL']}'"
  #system 'git config credential.helper "store --file=.git/credentials"'
  ## CREDENTIALS assigned by a Travis CI Secure Environment Variable
  ## see http://about.travis-ci.org/docs/user/build-configuration/#Secure-environment-variables for details
  #File.open('.git/credentials', 'w') {|f| f.write("https://#{ENV['GH_TOKEN']}:@github.com") }
  #set_pub_dates 'develop'
  #system 'git branch master origin/master'
  #run_awestruct '-P production -g --deploy'
  #File.delete '.git/credentials'
#end

desc 'Clean out generated site and temporary files'
task :clean, :spec do |task, args|
  require 'fileutils'
  dirs = ['.awestruct', '.sass-cache', '_site']
  if args[:spec] == 'all'
    dirs << '_tmp'
  end
  dirs.each do |dir|
    FileUtils.remove_dir dir unless !File.directory? dir
  end
end

# Perform initialization steps, such as setting up the PATH
task :init do
  # Detect using gems local to project
  if File.exist? '_bin'
    ENV['PATH'] = "_bin#{File::PATH_SEPARATOR}#{ENV['PATH']}"
    ENV['GEM_HOME'] = '.bundle'
  end
end

desc 'Check to ensure the environment is properly configured'
task :check => :init do
  if !File.exist? 'Gemfile'
    if which('awestruct').nil?
      msg 'Could not find awestruct.', :warn
      msg 'Run `rake setup` or `rake setup[local]` to install from RubyGems.'
      # Enable once the rubygem-awestruct RPM is available
      #msg 'Run `sudo yum install rubygem-awestruct` to install via RPM. (Fedora >= 18)'
      exit 1
    else
      $use_bundle_exec = false
      next
    end
  end

  begin
    require 'bundler'
    Bundler.setup
  rescue LoadError
    $use_bundle_exec = false
  rescue StandardError => e
    msg e.message, :warn
    if which('awestruct').nil?
      msg 'Run `rake setup` or `rake setup[local]` to install required gems from RubyGems.'
    else
      msg 'Run `rake update` to install additional required gems from RubyGems.'
    end
    exit e.status_code
  end
end

# Execute Awestruct
def run_awestruct(args)
  system "#{$use_bundle_exec ? 'bundle exec ' : ''}awestruct #{args}" 
end

# A cross-platform means of finding an executable in the $PATH.
# Respects $PATHEXT, which lists valid file extensions for executables on Windows
#
#  which 'awestruct'
#  => /usr/bin/awestruct
def which(cmd, opts = {})
  unless $awestruct_cmd.nil? || opts[:clear_cache]
    return $awestruct_cmd
  end

  $awestruct_cmd = nil
  exts = ENV['PATHEXT'] ? ENV['PATHEXT'].split(';') : ['']
  ENV['PATH'].split(File::PATH_SEPARATOR).each do |path|
    exts.each do |ext|
      candidate = File.join path, "#{cmd}#{ext}"
      if File.executable? candidate
        $awestruct_cmd = candidate
        return $awestruct_cmd
      end
    end
  end
  return $awestruct_cmd
end

# Print a message to STDOUT
def msg(text, level = :info)
  case level
  when :warn
    puts "\e[31m#{text}\e[0m"
  else
    puts "\e[33m#{text}\e[0m"
  end
end

