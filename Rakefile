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
  exit 1 unless $?.success?
end

desc 'Update the environment to run Jekyll'
task :update do
  system 'bundle update'
  exit 1 unless $?.success?
end

desc 'Regenerate the Antora navigation bar partial from _data/navigation.yml'
task :antora_nav do
  generate_antora_nav
end

desc 'Build and preview the site locally in development mode'
task :preview do
  generate_antora_nav
  run_antora
  clone_versions
  create_context7_files()

  system 'bundle install'
  exit 1 unless $?.success?

  system "#{$use_bundle_exec ? 'bundle exec ' : ''}jekyll serve --host 0.0.0.0 --livereload" or raise "Jekyll build failed"
  exit 1 unless $?.success?

end

desc 'Build the site for the given environment: development (the default), staging, or production'
task :build, [:environment] do |task, args|
  args.with_defaults(:environment => 'development')

  generate_antora_nav
  run_antora
  system 'bundle install'
  exit 1 unless $?.success?

  system "JEKYLL_ENV=#{args[:environment]} bundle exec jekyll build"
  exit 1 unless $?.success?

  clone_versions

  create_context7_files()

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

def create_context7_files()
  base_path = "_site/documentation/reference"
  raise ArgumentError, "'#{base_path}' is not a directory" unless Dir.exist?(base_path)

  create_context7_file(base_path, "debezium_io_reference")

  Dir.glob("#{base_path}/*/").each do |subdir|
    dir_name = File.basename(subdir)
    slug = "debezium_io_reference_#{dir_name.tr('.','_')}"
    create_context7_file(subdir, slug)
  end
end

def create_context7_file(file_dir, slug)
  content = <<~JSON
    {
      "url": "https://context7.com/websites/#{slug}",
      "public_key": "pk_4bmn60gBy8u78Juf3Zn1c"
    }
  JSON

  filepath = File.join(file_dir, "context7.json")
  File.write(filepath, content)
  puts "Created: #{filepath}"
end

# ---------------------------------------------------------------------------
# Antora navigation bar
# ---------------------------------------------------------------------------
# The documentation is rendered by Antora (Handlebars) and the rest of the site
# by Jekyll (Liquid), in two separate passes, and Antora runs first. It
# therefore cannot read anything Jekyll produces, so the shared top navigation
# has to reach it some other way.
#
# Rather than keep a second copy of the menu written in Handlebars - which would
# drift the first time somebody edited only one of them - the bar is generated
# here from _data/navigation.yml, the same file _includes/dbz/nav.html renders,
# and written out as a static partial before Antora is invoked.
#
# The generated partial is committed rather than ignored. ANTORA.md documents
# running `antora playbook.yml` by hand inside the builder container, and a
# partial that only exists after a rake run would fail that with an unhelpful
# Handlebars error. Every rake build regenerates it, so a stale commit repairs
# itself on the next build.
#
# `dynamic:` entries expand to a generated version list, the same way
# _includes/dbz/nav-versions.html expands them on the Jekyll side. Antora does
# render its own version selector in the toolbar, but omitting these left the
# Documentation menu visibly shorter here than the identically-labelled menu on
# the site - which is precisely the drift this generator exists to prevent.
ANTORA_NAV_PARTIAL = '_antora/supplemental_ui/partials/dbz-navbar.hbs'

# Inline SVGs, copied from _includes/dbz/icon.html so the two bars use the same
# glyphs. Stroked with currentColor, so they follow the surrounding text colour
# and need no per-theme handling.
ANTORA_NAV_ICONS = {
  'chevron-down' => '<path d="M6 9l6 6 6-6"/>',
  'menu'         => '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
  'sun'          => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>' \
                    '<path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/>' \
                    '<path d="M20 12h2"/><path d="M6.3 17.7l-1.4 1.4"/><path d="M19.1 4.9l-1.4 1.4"/>',
  'moon'         => '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  'external'     => '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' \
                    '<path d="M15 3h6v6"/><path d="M10 14L21 3"/>',
  'github'       => '<path stroke="none" fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 ' \
                    '11.5 0 0 0 7.9 10.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3' \
                    '-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5' \
                    '-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2' \
                    'a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1' \
                    ' 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12' \
                    ' 11.5 11.5 0 0 0 12 .5z"/>'
}.freeze

def antora_nav_icon(name, css_class)
  body = ANTORA_NAV_ICONS.fetch(name)
  %(<svg class="#{css_class}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ) +
    %(stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ) +
    %(aria-hidden="true" focusable="false">#{body}</svg>)
end

# A divider is there to separate the static entries from the generated version
# list that follows. If an entry has no such list, a trailing divider would draw
# a rule with nothing under it.
def antora_nav_children(item)
  children = (item['children'] || []).dup
  return children if item['dynamic']
  children.shift while children.first && children.first['divider']
  children.pop   while children.last  && children.last['divider']
  children.each_with_index.reject do |child, index|
    child['divider'] && index > 0 && children[index - 1]['divider']
  end.map(&:first)
end

# Release files carry `date:` values, and Psych 4 - what Ruby 3.1 and later
# ship - refuses to instantiate a Date under its default safe loader. Nothing
# but scalars is read out of these files, but the whole document still has to
# parse, so Date and Time have to be permitted explicitly.
def antora_load_yaml(path)
  require 'date'
  YAML.load_file(path, permitted_classes: [Date, Time], aliases: true)
rescue ArgumentError
  # Psych 3 takes no keyword arguments here and loads dates unconditionally.
  YAML.load_file(path)
end

# The generated version list, ported from _includes/dbz/nav-versions.html.
#
# Newest series first. The first stable series encountered is the current one
# and is labelled as such; anything not stable is a development series.
#
# Finding the newest release in a series is the non-obvious part, and matches
# what the Liquid does: sort the file names in the series directory and take
# the second to last, because `series.yml` always sorts after the releases.
def antora_nav_versions(kind)
  versions = antora_load_yaml('_data/versions.yml')['versions'].reverse
  seen_stable = false
  rows = []

  versions.each do |version|
    dir = "_data/releases/#{version}"
    series_file = File.join(dir, 'series.yml')
    next unless File.exist?(series_file)

    series = antora_load_yaml(series_file)
    next unless series['displayed']

    names = Dir.glob(File.join(dir, '*.yml')).map { |f| File.basename(f, '.yml') }.sort
    next if names.size < 2

    latest_file = File.join(dir, "#{names[-2]}.yml")
    next unless File.exist?(latest_file)
    stable = antora_load_yaml(latest_file)['stable'] ? true : false

    if stable
      label = seen_stable ? 'stable' : 'latest stable'
      seen_stable = true
    else
      label = 'development'
    end

    href = kind == 'releases' ? "/releases/#{version}/"
                              : "/documentation/reference/#{version}/"
    rows << { 'version' => version, 'href' => href, 'label' => label, 'stable' => stable }
  end

  rows
end

def generate_antora_nav()
  require 'cgi'

  nav = antora_load_yaml('_data/navigation.yml')
  brand = nav['brand']
  esc = ->(text) { CGI.escapeHTML(text.to_s) }
  out = []

  out << '{{!--'
  out << '    GENERATED FILE - DO NOT EDIT.'
  out << ''
  out << '    Written by `generate_antora_nav` in the Rakefile from'
  out << '    _data/navigation.yml, which is also what _includes/dbz/nav.html'
  out << '    renders for the Jekyll side of the site. Edit that data file and'
  out << '    run `rake antora_nav`; editing this partial by hand will be undone'
  out << '    by the next build.'
  out << '--}}'
  out << '<a class="dbz-skip" href="#dbz-doc-main">Skip to content</a>'
  out << '<header class="dbz-nav" data-dbz-nav>'
  out << '  <div class="dbz-nav__inner">'

  out << %(    <a class="dbz-nav__brand" href="#{esc.(brand['href'])}" aria-label="#{esc.(brand['alt'])} home">)
  out << %(      <img class="dbz-nav__logo dbz-nav__logo--light" src="#{esc.(brand['logo_light'])}" alt="#{esc.(brand['alt'])}" width="180" height="28">)
  out << %(      <img class="dbz-nav__logo dbz-nav__logo--dark" src="#{esc.(brand['logo_dark'])}" alt="#{esc.(brand['alt'])}" width="180" height="28">)
  out << '    </a>'

  # ------------------------------------------------------------ desktop menu
  out << '    <nav class="dbz-nav__menu" aria-label="Main">'
  nav['items'].each do |item|
    # Every page this partial renders on lives under /documentation/, so the
    # active entry is known at generation time and needs no script.
    active = item['match'] == '/documentation' ? ' is-active' : ''
    children = antora_nav_children(item)

    if children.empty?
      out << %(      <a class="dbz-navlink#{active}" href="#{esc.(item['href'])}">#{esc.(item['label'])}</a>)
      next
    end

    out << '      <div class="dbz-dropdown" data-dbz-dropdown>'
    out << %(        <button type="button" class="dbz-navlink dbz-dropdown__trigger#{active}" aria-expanded="false" aria-haspopup="true" data-dbz-dropdown-trigger>)
    out << %(          #{esc.(item['label'])}#{antora_nav_icon('chevron-down', 'dbz-dropdown__caret')})
    out << '        </button>'
    out << '        <div class="dbz-dropdown__panel"><div class="dbz-dropdown__card">'
    children.each do |child|
      if child['divider']
        out << '          <hr class="dbz-dropdown__rule">'
        next
      end
      rel = child['external'] ? ' target="_blank" rel="noopener"' : ''
      marker = child['external'] ? antora_nav_icon('external', 'dbz-icon-xs') : ''
      out << %(          <a class="dbz-dropdown__item" href="#{esc.(child['href'])}"#{rel}>)
      out << %(            <span class="dbz-dropdown__label">#{esc.(child['label'])}#{marker}</span>)
      if child['description']
        out << %(            <span class="dbz-dropdown__desc">#{esc.(child['description'])}</span>)
      end
      out << '          </a>'
    end
    if item['dynamic']
      out << '          <div class="dbz-dropdown__section">Versions</div>'
      out << '          <div class="dbz-dropdown__versions">'
      antora_nav_versions(item['dynamic']).each do |row|
        badge = row['stable'] ? 'dbz-badge dbz-badge--stable' : 'dbz-badge dbz-badge--dev'
        out << %(            <a class="dbz-version" href="#{esc.(row['href'])}">)
        out << %(              <span class="dbz-version__number">#{esc.(row['version'])}</span>)
        out << %(              <span class="#{badge}">#{esc.(row['label'])}</span>)
        out << '            </a>'
      end
      out << '          </div>'
    end
    out << '        </div></div>'
    out << '      </div>'
  end
  out << '    </nav>'

  # -------------------------------------------------------------- right side
  out << '    <div class="dbz-nav__controls">'
  out << %(      <a class="dbz-iconbtn dbz-nav__github" href="https://github.com/debezium" target="_blank" rel="noopener" aria-label="Debezium on GitHub">#{antora_nav_icon('github', 'dbz-icon')}</a>)
  out << '      <button type="button" class="dbz-iconbtn" data-dbz-theme-toggle aria-pressed="true" aria-label="Switch to light theme">'
  out << %(        <span class="dbz-theme-toggle__sun">#{antora_nav_icon('sun', 'dbz-icon')}</span>)
  out << %(        <span class="dbz-theme-toggle__moon">#{antora_nav_icon('moon', 'dbz-icon')}</span>)
  out << '      </button>'
  if nav['cta']
    out << %(      <a class="dbz-cta" href="#{esc.(nav['cta']['href'])}">#{esc.(nav['cta']['label'])}</a>)
  end
  out << %(      <button type="button" class="dbz-iconbtn dbz-nav__burger" data-dbz-drawer-toggle aria-expanded="false" aria-controls="dbz-drawer" aria-label="Open menu">#{antora_nav_icon('menu', 'dbz-icon')}</button>)
  out << '    </div>'
  out << '  </div>'

  # ----------------------------------------------------------- mobile drawer
  out << '  <div class="dbz-drawer" id="dbz-drawer" data-dbz-drawer>'
  out << '    <nav class="dbz-drawer__nav" aria-label="Mobile">'
  nav['items'].each_with_index do |item, index|
    children = antora_nav_children(item)

    if children.empty?
      out << %(      <a class="dbz-drawer__link" href="#{esc.(item['href'])}">#{esc.(item['label'])}</a>)
      next
    end

    panel = "dbz-submenu-#{index + 1}"
    out << '      <div>'
    out << %(        <button type="button" class="dbz-drawer__toggle" data-dbz-submenu-toggle aria-expanded="false" aria-controls="#{panel}">)
    out << %(          #{esc.(item['label'])}#{antora_nav_icon('chevron-down', 'dbz-dropdown__caret')})
    out << '        </button>'
    out << %(        <div class="dbz-drawer__submenu" id="#{panel}"><div class="dbz-drawer__submenu-inner">)
    children.each do |child|
      next if child['divider']
      rel = child['external'] ? ' target="_blank" rel="noopener"' : ''
      marker = child['external'] ? antora_nav_icon('external', 'dbz-icon-xs') : ''
      out << %(          <a class="dbz-drawer__sublink" href="#{esc.(child['href'])}"#{rel}>#{esc.(child['label'])}#{marker}</a>)
    end
    if item['dynamic']
      out << '          <div class="dbz-dropdown__section">Versions</div>'
      antora_nav_versions(item['dynamic']).each do |row|
        badge = row['stable'] ? 'dbz-badge dbz-badge--stable' : 'dbz-badge dbz-badge--dev'
        out << %(          <a class="dbz-drawer__sublink dbz-version" href="#{esc.(row['href'])}">)
        out << %(            <span class="dbz-version__number">#{esc.(row['version'])}</span>)
        out << %(            <span class="#{badge}">#{esc.(row['label'])}</span>)
        out << '          </a>'
      end
    end
    out << '        </div></div>'
    out << '      </div>'
  end
  if nav['cta']
    out << %(      <a class="dbz-drawer__cta" href="#{esc.(nav['cta']['href'])}">#{esc.(nav['cta']['label'])}</a>)
  end
  out << '    </nav>'
  out << '  </div>'
  out << '</header>'

  File.write(ANTORA_NAV_PARTIAL, out.join("\n") + "\n")
  puts "Generated #{ANTORA_NAV_PARTIAL} from _data/navigation.yml"
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
