module Awestruct::Extensions::AuthorsHelper
  def lookup_name(nicks)
    names = nicks.split(",").map { |nick|
      nick = nick.strip
      author = site.authors[nick]
      name = author ? author["name"] : nick
      name ? name : "Unknown"
    }

    names.join(", ")
  end
end
