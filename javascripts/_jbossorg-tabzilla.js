/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Tabzilla global navigation for Mozilla projects
 *
 * This code is licensed under the Mozilla Public License 1.1.
 *
 * Event handling portions adapted from the YUI Event component used under
 * the following license:
 *
 *   Copyright © 2012 Yahoo! Inc. All rights reserved.
 *
 *   Redistribution and use of this software in source and binary forms,
 *   with or without modification, are permitted provided that the following conditions
 *   are met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of Yahoo! Inc. nor the names of YUI's contributors may
 *     be used to endorse or promote products derived from this software
 *     without specific prior written permission of Yahoo! Inc.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Portions adapted from the jQuery Easing plugin written by Robert Penner and
 * used under the following license:
 *
 *   Copyright 2001 Robert Penner
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are
 *   met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of the author nor the names of contributors may be
 *     used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @copyright 2012 silverorange Inc.
 * @license   http://www.mozilla.org/MPL/MPL-1.1.html Mozilla Public License 1.1
 * @author    Michael Gauthier <mike@silverorange.com>
 * @author    Steven Garrity <steven@silverorange.com>
 */

function Tabzilla()
{
    if (typeof jQuery != 'undefined' && jQuery) {
        jQuery(document).ready(Tabzilla.init);
    } else {
        Tabzilla.run();
    }
}

Tabzilla.READY_POLL_INTERVAL = 40;
Tabzilla.readyInterval = null;
Tabzilla.jQueryCDNSrc =
    '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';

Tabzilla.hasCSSTransitions = (function() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="'
        + '-webkit-transition: color 1s linear;'
        + '-moz-transition: color 1s linear;'
        + '-ms-transition: color 1s linear;'
        + '-o-transition: color 1s linear;'
        + '"></div>';

    var hasTransitions = (
           (div.firstChild.style.webkitTransition !== undefined)
        || (div.firstChild.style.MozTransition !== undefined)
        || (div.firstChild.style.msTransition !== undefined)
        || (div.firstChild.style.OTransition !== undefined)
    );

    delete div;

    return hasTransitions;
})();

/**
 * Sets up the DOMReady event for Tabzilla
 *
 * Adapted from the YUI Event component. Defined in Tabzilla so we do not
 * depend on YUI or jQuery. The YUI DOMReady implementation is based on work
 * Dean Edwards, John Resig, Matthias Miller and Diego Perini.
 */
Tabzilla.run = function()
{
    var webkit = 0, isIE = false, ua = navigator.userAgent;
    var m = ua.match(/AppleWebKit\/([^\s]*)/);

    if (m && m[1]) {
        webkit = parseInt(m[1], 10);
    } else {
        m = ua.match(/Opera[\s\/]([^\s]*)/);
        if (!m || !m[1]) {
            m = ua.match(/MSIE\s([^;]*)/);
            if (m && m[1]) {
                isIE = true;
            }
        }
    }

    // Internet Explorer: use the readyState of a defered script.
    // This isolates what appears to be a safe moment to manipulate
    // the DOM prior to when the document's readyState suggests
    // it is safe to do so.
    if (isIE) {
        if (self !== self.top) {
            document.onreadystatechange = function() {
                if (document.readyState == 'complete') {
                    document.onreadystatechange = null;
                    Tabzilla.ready();
                }
            };
        } else {
            var n = document.createElement('p');
            Tabzilla.readyInterval = setInterval(function() {
                try {
                    // throws an error if doc is not ready
                    n.doScroll('left');
                    clearInterval(Tabzilla.readyInterval);
                    Tabzilla.readyInterval = null;
                    Tabzilla.ready();
                    n = null;
                } catch (ex) {
                }
            }, Tabzilla.READY_POLL_INTERVAL);
        }

    // The document's readyState in Safari currently will
    // change to loaded/complete before images are loaded.
    } else if (webkit && webkit < 525) {
        Tabzilla.readyInterval = setInterval(function() {
            var rs = document.readyState;
            if ('loaded' == rs || 'complete' == rs) {
                clearInterval(Tabzilla.readyInterval);
                Tabzilla.readyInterval = null;
                Tabzilla.ready();
            }
        }, Tabzilla.READY_POLL_INTERVAL);

    // FireFox and Opera: These browsers provide a event for this
    // moment.  The latest WebKit releases now support this event.
    } else {
        Tabzilla.addEventListener(document, 'DOMContentLoaded', Tabzilla.ready);
    }
};

Tabzilla.ready = function()
{
    if (!Tabzilla.DOMReady) {
        Tabzilla.DOMReady = true;

        var onLoad = function() {
            Tabzilla.init();
            Tabzilla.removeEventListener(
                document,
                'DOMContentLoaded',
                Tabzilla.ready
            );
        };

        // if we don't have jQuery, dynamically load jQuery from CDN
        if (typeof jQuery == 'undefined') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = Tabzilla.jQueryCDNSrc;
            document.getElementsByTagName('body')[0].appendChild(script);

            if (script.readyState) {
                // IE
                script.onreadystatechange = function() {
                    if (   script.readyState == 'loaded'
                        || script.readyState == 'complete'
                    ) {
                        onLoad();
                    }
                };
            } else {
                // Others
                script.onload = onLoad;
            }
        } else {
            onLoad();
        }
    }
};

Tabzilla.init = function()
{
    if (!Tabzilla.hasCSSTransitions) {
        // add easing functions
        jQuery.extend(jQuery.easing, {
            'easeInOut':  function (x, t, b, c, d) {
                if (( t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        });
    }

    Tabzilla.link  = document.getElementById('tab');
    Tabzilla.panel = Tabzilla.buildPanel();

    // add panel as first element of body element
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(Tabzilla.panel, body.firstChild);

    // set up event listeners for link
    Tabzilla.addEventListener(Tabzilla.link, 'click', function(e) {
        Tabzilla.preventDefault(e);
        Tabzilla.toggle();
    });

    Tabzilla.$panel = jQuery(Tabzilla.panel);
    Tabzilla.$link  = jQuery(Tabzilla.link);

    Tabzilla.$panel.addClass('tabnav-closed');
    Tabzilla.$link.addClass('tabnav-closed');
    Tabzilla.$panel.removeClass('tabnav-opened');
    Tabzilla.$link.removeClass('tabnav-opened');

    Tabzilla.opened = false;
    
    // initialize search bar now because it is injected into body during document.ready()
    initializeSearchBar();
};

Tabzilla.buildPanel = function()
{
    var panel = document.createElement('div');
    panel.id = 'tabnav-panel';
    panel.innerHTML = Tabzilla.content;
    return panel;
};

Tabzilla.addEventListener = function(el, ev, handler)
{
    if (typeof el.attachEvent != 'undefined') {
        el.attachEvent('on' + ev, handler);
    } else {
        el.addEventListener(ev, handler, false);
    }
};

Tabzilla.removeEventListener = function(el, ev, handler)
{
    if (typeof el.detachEvent != 'undefined') {
        el.detachEvent('on' + ev, handler);
    } else {
        el.removeEventListener(ev, handler, false);
    }
};

Tabzilla.toggle = function()
{
    if (Tabzilla.opened) {
        Tabzilla.close();
    } else {
        Tabzilla.open();
    }
};

Tabzilla.open = function()
{
    if (Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.addClass('tabnav-opened');
        Tabzilla.$link.addClass('tabnav-opened');
        Tabzilla.$panel.removeClass('tabnav-closed');
        Tabzilla.$link.removeClass('tabnav-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 225 }, 225, 'easeInOut');
    }

    Tabzilla.opened = true;
};

Tabzilla.close = function()
{
    if (!Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.removeClass('tabnav-opened');
        Tabzilla.$link.removeClass('tabnav-opened');
        Tabzilla.$panel.addClass('tabnav-closed');
        Tabzilla.$link.addClass('tabnav-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 0 }, 225, 'easeInOut');
    }

    Tabzilla.opened = false;
};

Tabzilla.preventDefault = function(ev)
{
    if (ev.preventDefault) {
        ev.preventDefault();
    } else {
        ev.returnValue = false;
    }
};

Tabzilla.content =
'<div class="tabnavclearfix" id="tabnav">'
+'  <ul class="listclear">'
+'    <li class="current"> <span class="notch">&nbsp;</span> <a class="menu-title" href="http://www.jboss.org">JBoss Community</a>'
+'      <ul class="level1">'
+'        <li class="leaf"><a href="http://planet.jboss.org/view/all">Blogs</a></li>'
+'        <li class="leaf"><a href="http://twitter.com/#!/jbossdeveloper">Tweets</a></li>'
+'        <li class="leaf"><a href="http://www.facebook.com/jboss">Facebook</a></li>'
+'        <li class="leaf"><a href="http://jboss.org/twitter">Twitter</a></li>'
+'        <li class="leaf"><a href="http://www.linkedin.com/company/jboss">LinkedIn</a></li>'
+'        <li class="leaf"><a href="http://vimeo.com/jbossdeveloper">Vimeo</a></li>'
+'        <li class="leaf"><a href="http://asylum.libsyn.com/">Asylum</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/events">Events</a></li>'
+'      </ul>'
+'    </li>'
+'    <li class="current"> <span class="notch">&nbsp;</span> <a class="menu-title" href="http://www.jboss.org/developer">Get Started</a>'
+'      <ul class="level1">'
+'        <li class="leaf"><a href="http://devstudio.jboss.com/download/">Get Tool Kit (JBDS)</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/projects">Downloads</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/projects">Documentation</a></li>'
+'        <li class="leaf"><a href="http://community.jboss.org">Forums</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/webinars">Webinars</a></li>'
+'        <li class="leaf"><a href="http://java.dzone.com/category/tags/jboss">Articles</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/books">Books</a></li>'
+'      </ul>'
+'    </li>'
+'    <li class="current"> <span class="notch">&nbsp;</span> <a class="menu-title" href="http://www.jboss.org/contribute">Get Involved</a>'
+'      <ul class="level1">'
+'        <li class="leaf"><a href="http://community.jboss.org/">Wiki</a></li>'
+'        <li class="leaf"><a href="http://community.jboss.org/">Discussions</a></li>'
+'        <li class="leaf"><a href="http://issues.jboss.org">Issue Tracker</a></li>'
+'        <li class="leaf"><a href="http://source.jboss.org">Source Repositories</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/usergroups">User Groups</a></li>'
+'        <li class="leaf"><a class="menu-title" href="http://jboss.org/interests">Special Interest Groups</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/security">Report a Security Issue</a></li>'
+'      </ul>'
+'    </li>'
+'    <li class="open"> <span class="notch">&nbsp;</span> <a class="menu-title" href="http://www.jboss.org/projects">Projects</a>'
+'      <ul class="level1">'
+'        <!--<li class="leaf alpha">A-O</li>-->'
+'        <li class="leaf"><a href="http://www.jboss.org/jbossas">Application Server</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/jbossweb">Web Server</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/gatein">GateIn</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/jbossesb">ESB</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/drools">Drools</a></li>'
+'        <li class="leaf"><a href="http://www.hibernate.org">Hibernate</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/richfaces">RichFaces</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/tools">Tools</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/rhq">RHQ</a></li>'
+'        <li class="leaf viewmore"><a href="http://www.jboss.org/projects">More...</a></li>'
+'      </ul>'
+'    <li class="open"> <span class="notch">&nbsp;</span> <a class="menu-title" href="http://www.jboss.org/products">Products</a>'
+'      <ul class="level1">'
+'        <li class="leaf"><a href="http://www.jboss.org/products/eap">Application Platform</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/web-server/">Web Server</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/data-grid/">Data Grid</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/portal/">Portal Platform</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/soa">SOA Platform</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/data-services">Data Services Platform</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/products/fuse">Fuse</a></li>'
+'        <li class="leaf"><a href="http://www.jboss.org/products/amq">A-MQ</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/business-rules/">Business Rules Mgmt System</a></li>'
+'        <li class="leaf"><a href="https://www.jboss.org/products/jbds">Developer Studio</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/web-framework-kit">Web Framework Kit</a></li>'
+'        <li class="leaf"><a href="http://www.redhat.com/products/jbossenterprisemiddleware/operations-network">Operations Network</a></li>'
+'        <li class="leaf viewmore"><a href="http://www.jboss.org/products">More...</a></li>'
+'      </ul>'
+'    </li>    '
+'    <li id="tabnav-search">'
+'      <form action="#">'
+'      <input id="searchbar" type="text" value="" style="height:14px;">'
+'      </form>'
+'    </li>'
+'  </ul>'
+'</div>';

Tabzilla();
