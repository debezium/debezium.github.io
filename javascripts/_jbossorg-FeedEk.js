/* FeedEk jQuery RSS/ATOM Feed Plugin v1.1.2
*  http://jquery-plugins.net/FeedEk/FeedEk.html
*  Author : Engin KIZIL http://www.enginkizil.com
*  http://opensource.org/licenses/mit-license.php
*/
(function (e) {
    e.fn.FeedEk = function (t) {
        var n = {
        FeedUrl: "http://rss.cnn.com/rss/edition.rss", MaxCount: 6, ShowDesc: false, ShowPubDate: true, CharacterLimit: 0, TitleLinkTarget: "_blank" };
        if (t) {
            e.extend(n, t)
        }
        var r = e(this).attr("id");
        var i;
        e("#" + r).empty().append('<div style="padding:3px;"><img src="#{site.jborg_images_url}/common/loading.gif" /></div>');
        e.ajax({
            url: "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=" + n.MaxCount + "&output=json&q=" + encodeURIComponent(n.FeedUrl) + "&hl=en&callback=?",
            dataType: "json",
            success: function (t) {
                e("#" + r).empty();
                var s = "";
                e.each(t.responseData.feed.entries,
                    function (e, t) {
                        s += '<li><div class="avatar"><i class="icon-comment" /></div>';
                        if (t.author) {
                          s+= '<span class="name">' + t.author + '</span>';
                        }
                        if (n.ShowPubDate) {
                            i = new Date(t.publishedDate);
                            s += '<span class="meta">' + i.toLocaleDateString() + "</span>"
                        }
                        s += '<a href="' + t.link + '" target="' + n.TitleLinkTarget + '" >' + t.title + '</a>';
                        if (n.ShowDesc) {
                            if (n.CharacterLimit > 0 && t.content.length > n.CharacterLimit) {
                                s += '<div class="itemContent">' + t.content.substr(0, n.CharacterLimit) + "...</div>"
                            } else {
                                s += '<div class="itemContent">' + t.content + "</div>"
                            }
                        }
                        s += '</li>';
                    });
                e("#" + r).append('<ul class="listPosts">' + s + "</ul>");
            }
        })
    }
})(jQuery);