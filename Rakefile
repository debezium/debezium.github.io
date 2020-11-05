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
$awestruct_cmd = nil
$antora_config = "playbook.yml"
task :default => :preview

desc 'Setup the environment to run Awestruct'
task :setup, [:env] => :init do |task, args|
  next if !which('awestruct').nil?

  require 'fileutils'
  FileUtils.remove_dir '.bundle', true
  system 'bundle install --binstubs=_bin --path=.bundle'
  msg 'Run awestruct using `awestruct` or `rake`'
  # Don't execute any more tasks, need to reset env
  exit 0
end

desc 'Update the environment to run Awestruct'
task :update => :init do
  system 'bundle update'
  # Don't execute any more tasks, need to reset env
  exit 0
end

desc 'Build and preview the site locally in development mode'
task :preview => :check do
  run_antora
  run_awestruct '-d'
end

desc 'Generate the site using the development profile'
task :gen => :check do
  run_antora
  run_awestruct '-P development -g --force'
end

desc 'Push local commits to upstream/develop'
task :push do
  system 'git push upstream develop'
end

desc 'Generate the site and deploy to production branch using local dev environment'
task :deploy => [:check, :push] do
  run_antora
  run_awestruct '-P production -g --force --deploy'
end

desc 'Generate site using Travis CI and, if not a pull request, publish site to production (GitHub Pages).  Antora content will be built by Travis directly rather than this task.'
task :travis => :check do
  # if this is a pull request, do a simple build of the site and stop
  if ENV['TRAVIS_PULL_REQUEST'].to_s.to_i > 0
    msg 'Building pull request using production profile...'
    run_awestruct '-P production -g'
    next
  end

  repo = %x(git config remote.origin.url).gsub(/^git:/, 'https:')
  deploy_branch = 'master'
  msg "Building '#{deploy_branch}' branch using production profile..."
  system "git remote set-url --push origin #{repo}"
  system "git remote set-branches --add origin #{deploy_branch}"
  system 'git fetch -q'
  system "git config user.name '#{ENV['GIT_NAME']}'"
  system "git config user.email '#{ENV['GIT_EMAIL']}'"
  system 'git config credential.helper "store --file=.git/credentials"'
  # CREDENTIALS assigned by a Travis CI Secure Environment Variable
  # see http://awestruct.org/auto-deploy-to-github-pages/
  # and http://about.travis-ci.org/docs/user/build-configuration/#Secure-environment-variables for details
  File.open('.git/credentials', 'w') do |f|
    f.write("https://#{ENV['GH_TOKEN']}:x-oauth-basic@github.com")
  end
  system "git branch #{deploy_branch} origin/#{deploy_branch}"
  system "git status"
  run_awestruct '-P production -g --deploy'
  File.delete '.git/credentials'
end

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
    $use_bundle_exec = true
  rescue StandardError => e
    msg e.message, :warn
    if which('awestruct').nil?
      msg 'Run `rake setup` to install required gems from RubyGems.'
    else
      msg 'Run `rake update` to install additional required gems from RubyGems.'
    end
    exit e.status_code
  end
  # https://github.com/awestruct/awestruct/issues/549
  # that debug log statement causes a "no implicit conversion of nil into String" error
  # Let's just remove it...
  system 'sed -i "/.LOG.debug .inherit_front_matter_from for/d" .bundle/ruby/2.4.0/gems/awestruct-0.6.0.alpha4/lib/awestruct/page.rb'
  system 'sed -i "/.LOG.debug .inherit_front_matter_from for/d" vendor/bundle/ruby/2.4.0/gems/awestruct-0.6.0.alpha4/lib/awestruct/page.rb'
end

desc 'Configures Antora build process to use authoring mode, allowing changes to documentation files locally without needing to push changes to github'
task :author => :check do
  $antora_config = "playbook_author.yml"
end

# Execute Antora
def run_antora()
  puts "Generating Antora documentation using configuration: #{$antora_config}"
  if system "antora #{$antora_config}"
    puts "Antora documentation created"
  else
    puts "Antora failed"
    exit -1
  end
end

# Execute Awestruct
def run_awestruct(args)
  # used to bind Awestruct to 0.0.0.0
  # do export BIND="-b 0.0.0.0"
  if ENV['BIND'] && ENV['BIND'] != ''
    augmented_args = "#{ENV['BIND']} #{args}"
  else
    augmented_args = "#{args}"
  end
  system "#{$use_bundle_exec ? 'bundle exec ' : ''}jekyll serve" or raise "Awestruct build failed"
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
