Introduction
============
The aim of this repository is to provide a template for the creation of new JBoss Community projects using [Awestruct](http://awestruct.org) and [Bootstrap](http://twitter.github.com/bootstrap). These are projects created and led by [Red Hat](http://www.redhat.com) who own the associated trademarks. To avoid unnecessary complexity and satisfy legal requirements users are kindly asked to observe the following:

* This template should represent the majority view amongst users about the simplest and best way to create a website using Awestruct and Bootstrap (using LESS). It should strive to have the fewest dependencies and use the smallest number of template engines.

* Changes to the L&F will be vetoed by the [Visual Design Team](http://design.jboss.org) to ensure they meet branding guidelines and are consistent with the JBoss Community brand.

* Project logos and other trademarked images must be hosted at http://static-stg.jboss.org/theme/images/*[project]* and http://static.jboss.org/theme/images/*[project]*

System Requirements
===================
* Ruby 1.8.7 or above
* RubyGems - 1.3.6 or above
* Bundler - 1.3.5

* GNU Wget 1.14

Getting Started
===============
1. Download the contents of the repository
------------------------------------------
To use the template simply select the version you require with the *branch/tag* dropdown on the [GitHub page](https://github.com/jbossorg/bootstrap-community) and click on the *ZIP* button to download the contents to your local machine. The repo should only be forked if you're looking to make contributions.

**Note:** The first part of the version number indicates the Bootstrap version the theme is based on.

2. Build the website
--------------------
Run Awestruct in development mode from the top-level directory to build the website and host it using a local web server:

`bundle exec awestruct -d`

**Note:** The first time the site is built common JavaScript, font and image files will be downloaded from [http://static-stg.jboss.org](http://static-stg.jboss.org) and cached into a local *cache/* directory using wget. This then allows you to run the site locally rather than relying on a network connection. Currently the `wget` command will run on every build so to prevent this set the `wget: enabled:` property to `false` once the cache has been created.

**Tip:** Use the `--directory-prefix` option of the `wget: urls:` property in *_config/site.yml* if you wish to use a different directory name. A *.gitignore* file is automatically created in this directory containing a * to prevent you adding cached files to GIT by mistake. 

3. View the website
-------------------
Use a web browser to visit [http://localhost:4242](http://localhost:4242) where you can see the site.

4. Add/edit web pages and layouts
---------------------------------
Use a text editor to create/edit web pages and/or layouts. Use the `bootstrap_css_url` and `bootstrap_js_url` variables to ensure you refer to the locally built versions of the files in the development profile and the hosted versions in the staging and production profiles.

**Note:** Currently the template uses images from the JBoss Tools project. If you wish to use your own project images then you must upload them to http://static-stg.jboss.org/theme/images/*[project]*, edit the references in the layouts and edit the `http://static-stg.jboss.org/theme/images/tools/` line in the `wget: urls:` property in *_config/site.yml* to refer to your project directory.

5. Customize the theme
----------------------
To use the theme simply reference the hosted *bootstrap-community.css* and *bootstrap-community.js* files on [http://static.jboss.org](http://static.jboss.org). However if you wish to make project-specific changes then test them locally using the development profile and host the compiled css and js files in your project-specific staging/production domains. Update the `bootstrap_css_url` and `bootstrap_js_url` variables in the staging/production profiles to refer to them.
 
6. Stage the website
--------------------
Once you're happy with your website in development mode update the `profiles: staging: base_url:` property in *_config/site.yml* to point to your staging domain and run the `bundle exec awestruct -P staging` command to generate a version that can be uploaded for others to review.

7. Publish the website
----------------------
If everyone is happy with staging then update the `profiles: production: base_url:` property in *_config/site.yml* to point to your production domain and run the `bundle exec awestruct -P production` command to produce a version that can be uploaded for the public to view.
