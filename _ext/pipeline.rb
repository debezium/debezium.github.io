require 'wget_wrapper'
require 'js_minifier'
require 'css_minifier'
require 'html_minifier'
require 'file_merger'
require 'less_config'
require 'symlinker'
require 'breadcrumb'

Awestruct::Extensions::Pipeline.new do
  helper Awestruct::Extensions::Partial
  helper Awestruct::Extensions::Breadcrumb
  helper Awestruct::Extensions::GoogleAnalytics
  extension Awestruct::Extensions::WgetWrapper.new
  transformer Awestruct::Extensions::JsMinifier.new
  transformer Awestruct::Extensions::CssMinifier.new
  transformer Awestruct::Extensions::HtmlMinifier.new
  extension Awestruct::Extensions::FileMerger.new
  extension Awestruct::Extensions::LessConfig.new
  extension Awestruct::Extensions::Symlinker.new
end

