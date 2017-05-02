require 'wget_wrapper'
require 'js_minifier'
require 'css_minifier'
require 'html_minifier'
require 'file_merger'
require 'less_config'
require 'symlinker'
require 'breadcrumb'
require 'autotag'
require 'authors_helper'
require 'redirect_creator'
#require 'releases'

Awestruct::Extensions::Pipeline.new do
  helper Awestruct::Extensions::Partial
  helper Awestruct::Extensions::Breadcrumb
  helper Awestruct::Extensions::AuthorsHelper
  helper Awestruct::Extensions::GoogleAnalytics
  extension Awestruct::Extensions::WgetWrapper.new
  transformer Awestruct::Extensions::JsMinifier.new
  transformer Awestruct::Extensions::CssMinifier.new
  transformer Awestruct::Extensions::HtmlMinifier.new
  extension Awestruct::Extensions::FileMerger.new
  extension Awestruct::Extensions::LessConfig.new
  extension Awestruct::Extensions::Symlinker.new

  # Process the blog posts and ensure each has an array of (possibly empty) tags ...
  extension Awestruct::Extensions::Posts.new('/blog', :posts)
  extension Awestruct::Extensions::AutoTag.new(:posts)

  # Generate the pages for the blog
  extension Awestruct::Extensions::Paginator.new(:posts, '/blog/index', :per_page => 5)
  extension Awestruct::Extensions::Tagger.new(:posts, '/blog/index', '/blog/tags', :per_page => 5)
  extension Awestruct::Extensions::TagCloud.new(:posts, '/blog/tags/index.html')

  # Indexifier moves HTML files to their own directory to achieve "pretty" URLs (e.g., docs.html -> /docs/index.html)
  extension Awestruct::Extensions::Indexifier.new([/\/404.html/]) # don't indexify 404 page

  extension Awestruct::Extensions::Atomizer.new(:posts, '/blog.atom', {:feed_title=>'Debezium Blog', :template=>'_layouts/atom.xml.haml'})

  extension Awestruct::Extensions::RedirectCreator.new("redirects")
  extension Awestruct::Extensions::Disqus.new

  #extension Release.new
end
