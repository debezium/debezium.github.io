# This file is a rake build file. The purpose of this file is to simplify
# setting up and using Jekyll. It's not required to use Jekyll, though it
# does save you time (hopefully). If you don't want to use rake, just ignore or
# delete this file.
#
# If you're just getting started, execute this command to install Jekyll and
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
# There are also tasks for running Jekyll. The build will auto-detect
# whether you are using Bundler and, if you are, wrap calls to Jekyll in
# `bundle exec`.
#
# To run in Jekyll in development mode, execute:
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
# Now you're Jekyll with rake!
require "rubygems"
require "tmpdir"
require "bundler/setup"
require "jekyll"

$use_bundle_exec = false
$antora_config = "playbook.yml"
task :default => :preview


desc 'Update the environment to run Jekyll'
task :update => :init do
  system 'bundle update'
  exit 0
end

desc 'Build and preview the site locally in development mode'
task :preview => :check do
  run_antora
  system "#{$use_bundle_exec ? 'bundle exec ' : ''}jekyll serve --host 0.0.0.0" or raise "Jekyll build failed"
end

desc 'Push local commits to origin/website-migration'
task :push do
  system 'git push origin website-migration'
end

desc 'Generate the site and deploy to production branch using local dev environment'
task :deploy => [:check, :push] do
  run_antora
  system "jekyll build" or raise "Jekyll build failed"
end

desc 'Generate site using Travis CI and, if not a pull request, publish site to production (GitHub Pages).  Antora content will be built by Travis directly rather than this task.'
task :travis => :check do
  # if this is a pull request, do a simple build of the site and stop
  if ENV['TRAVIS_PULL_REQUEST'].to_s.to_i > 0
    msg 'Building pull request using production profile...'
    system "bundle exec jekyll build" or raise "Jekyll build failed"
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
  system "bundle exec jekyll build" or raise "Jekyll build failed"
  File.delete '.git/credentials'
end

desc 'Clean out generated site and temporary files'
task :clean, :spec do |task, args|
  require 'fileutils'
  dirs = ['.jekyll-cache', '.sass-cache', '_site']
  if args[:spec] == 'all'
    dirs << '_tmp'
  end
  dirs.each do |dir|
    FileUtils.remove_dir dir unless !File.directory? dir
  end
end

desc 'Configures Antora build process to use authoring mode, allowing changes to documentation files locally without needing to push changes to github'
task :author => :check do
  $antora_config = "playbook_author.yml"
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
    if which('jekyl').nil?
      msg 'Could not find jekyl.', :warn
      msg 'Run `rake setup` to install from RubyGems.'
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
    if which('jekyl').nil?
      msg 'Run `rake setup` to install required gems from RubyGems.'
    else
      msg 'Run `rake update` to install additional required gems from RubyGems.'
    end
    exit e.status_code
  end
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

# Print a message to STDOUT
def msg(text, level = :info)
  case level
  when :warn
    puts "\e[31m#{text}\e[0m"
  else
    puts "\e[33m#{text}\e[0m"
  end
end