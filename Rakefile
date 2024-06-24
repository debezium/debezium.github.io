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
require 'yaml'

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
  clone_versions
  system 'bundle install'
  system "#{$use_bundle_exec ? 'bundle exec ' : ''}jekyll serve --host 0.0.0.0 --livereload" or raise "Jekyll build failed"
end

desc 'Build the site for the given environment: development (the default), staging, or production'
task :build, [:environment] do |task, args|
  args.with_defaults(:environment => 'development')

  run_antora
  system 'bundle install'
  system "JEKYLL_ENV=#{args[:environment]} bundle exec jekyll build"
  clone_versions
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

# Clone specified versions to stable and devel
def clone_versions()  
  require 'fileutils'  
  playbook = YAML.load_file($antora_config)
  latestStableVersion = playbook['asciidoc']['attributes']['page-version-current']
  latestDevelVersion = playbook['asciidoc']['attributes']['page-version-devel']

  stableDir = "_site/documentation/reference/stable";
  develDir = "_site/documentation/reference/devel"
  $refDir = "_site/documentation/reference"

  if File.exist?($refDir)
    # Crete nigtly folder
    FileUtils.mkdir_p("#{$refDir}/nightly/")
    # Copy all .html files into nightly
    Dir.glob("#{$refDir}/*.html").each do|f|
      FileUtils.cp_r f, "#{$refDir}/nightly"
    end
    # Copy below specified folders into nightly
    FileUtils.cp_r "_site/documentation/debezium-antora", "_site/documentation/reference"
    FileUtils.cp_r "#{$refDir}/configuration", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/connectors", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/development", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/integrations", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/operations", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/transformations", "#{$refDir}/nightly"
    FileUtils.cp_r "#{$refDir}/post-processors", "#{$refDir}/nightly"
  else
    puts "Unable to find reference dir"
  end 
  if File.exist?(stableDir)
   FileUtils.cp_r stableDir, "_site/documentation/reference/#{latestStableVersion}"
  else
    puts "Unable to find stable version dir"
  end  
  if File.exist?(develDir)    
   FileUtils.cp_r develDir, "_site/documentation/reference/#{latestDevelVersion}"
  else
    puts "Unable to find devel version dir"
  end
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
