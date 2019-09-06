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

  def lookup_avatar(nick)
    avatar = "color_debezium_64px.png"

    author = lookup_author(nick)
    if author.nil?
      return "/images/" + avatar
    else
      user_avatar = author["avatar"]
      if user_avatar.nil?
        return "/images/" + avatar
      end
      return "/images/" + user_avatar
    end
  end

  def lookup_author(nick)
    return site.authors[nick]
  end

end
