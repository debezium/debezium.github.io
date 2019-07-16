module Awestruct::Extensions::CanonicalsHelper
  def lookup_canonical(url)
    site.canonicals[url]  
  end
end
