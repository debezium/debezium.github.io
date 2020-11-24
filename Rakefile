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
# To get a list of all tasks, execute:
#
#  rake -T
#
# Now you're Jekyll with rake!
require 'jekyll'
$use_bundle_exec = true
$antora_config = "playbook.yml"
task :default => :build

desc 'Install the environment to run Jekyll'
task :install do
  system 'bundle install'
  exit 0
end

desc 'Update the environment to run Jekyll'
task :update do
  system 'bundle update'
  exit 0
end

desc 'Build and preview the site locally in development mode'
task :preview do
  run_antora
  system 'bundle install'
  system "#{$use_bundle_exec ? 'bundle exec ' : ''}jekyll serve --host 0.0.0.0 --livereload" or raise "Jekyll build failed"
end

desc 'Build the site for production'
task :build do
  run_antora
  system 'bundle install'
  system 'JEKYLL_ENV=production bundle exec jekyll build'
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
task :author do
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
