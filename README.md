JBoss Community theme startup repository
===================

Introduction
------------

This repository is an Awestruct example site built using Bootstrap with a help of various extensions which make it follow a look and feel of JBoss Community theme. It's also made as easy as possible to fork this repository in order to build your own JBoss Community theme based site, leveraging all the provided customizations.  
As mentioned before the theme is based as much as possible on [Bootstrap](http://twitter.github.io/bootstrap/) front-end framework. The idea is to include the newest Bootstrap libraries and provide a set of extensions by which the look and feel of JBoss Community is seamlessly applied.
[Awestruct](http://awestruct.org), a framework for creating static HTML sites, was chosen as the best match for creating our JBoss Community sites. Therefore the repository contains a valid Awestruct site, which can be easily extended, built and deployed.  
In this Readme we imply that person reading is familiar with Awestruct and Bootstrap projects, please refer to documentation provided by those projects when needed.  

Required installed software
---------------------------

* Ruby Gems: awestruct, execjs, therubyracer, uglifier, cssminify, html_press
* `wget` shell command

Getting started - fast track
----------------------------

* Fork the repository.
* Make a checkout.
* Boot it up with Awestruct runtime: `awestruct -d`
* Open your web browser on [http://localhost:4242](http://localhost:4242) and take a look what you get for a start.

Getting started - filling out missing configuration
---------------------------------------------------

Please open _config/site.yml for editing and correct following entries:
* In `wget` urls configuration section, the last URL is a placeholder for location of your project copyrighted images stored on static.jboss.org domain.
* Awestruct profiles section defines `base_url` variable for `staging` and `production` environments and once again, it requires update with a valid URL.

More detailed description of all repository contents
----------------------------------------------------

`_config` - This directory contains Awestruct configuration. A detailed description of provided settings can be found in the next section of this document.  
`_ext` directory - contains a set of Awestruct extensions. Each of them contains detailed information about its usage and configuration at the beginning of source file.  
`_layouts` directory - contains our main community layout file `project.html.haml` which applies JBoss Community theme to a particular page. It also contains `project-nav.html.haml` file which extends the layout with a project navigation.  
`javascripts` - obviously it contains JavaScript files used in our theme. Mostly those are Bootstrap libraries with two additional files specific to our theme.  
`stylesheets` - contains Less implementation of Bootstrap along with our extensions over it. `bootstrap-default.less` file builds up as a default implementation of Bootstrap styles whereas `bootstrap-community.less` adds also our additional style modifications.  
`index.html.haml` - an example project website  
`swatch.html.haml` - a showcase of Bootstrap styles for an easy copy&paste reference  

Provided Awestruct configuration
--------------------------------

* `title` - is a default page title unless it's overriden by page setting
* `css_minifier, js_minifier, html_minifier` - are settings for Awestruct extensions provided in `_ext` directory which minimize text content of corresponding file types. Disabled by default and enabled later in staging and production profiles.
* `fileMerger` section is again a configuration for an Awestruct extension which merges listed files into a one. We use it here for merging of all JavaScript files.
* `wget` section defines which URL trees need to be downloaded into a `cache` directory. It's provided due to copyrights of content stored under those URLs. It cannot be hosted on GitHub but still for development purposes it's convenient to use it from local storage. This extension relies on `wget` shell command. You may find it useful to disable it after first download if you don't expect any new images comming as it lengthens a build process.
* `profiles` section as defined by Awestruct provides configuration settings specific for different build modes. In our case it's used mostly to change URLs to various external theme contents and switch on files minification in production profile.