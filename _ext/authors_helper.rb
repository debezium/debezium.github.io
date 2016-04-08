module Awestruct::Extensions::AuthorsHelper
  def lookup_name(nick)
    author = site.authors[nick]
    name = author ? author["name"] : nick
    name ? name : "Unknown"
  end
end