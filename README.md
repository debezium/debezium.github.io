# Upstream Community Theme

The Upstream Community Theme is a ready-to-use [Jekyll](https://jekyllrb.com/) theme to help you create a basic static site for your project. It was designed with the Red Hat Upstream Community in mind, but can be used by anyone looking to create a simple, lightweight site.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes. See deployment for notes on how to deploy the project on [GitHub Pages](https://pages.github.com/).

### Prerequisites

 - Install a full [Ruby development environment](https://www.ruby-lang.org/en/downloads/). Ruby version 2.4.0 or above is required, including all development headers. You can run `ruby -v` to check your current Ruby version.
 - [RubyGems](https://rubygems.org/pages/download). You can run `gem -v` to check if you have RubyGems installed.
 - [GCC](https://gcc.gnu.org/install/) and [Make](https://www.gnu.org/software/make/). You can run `gcc -v`,`g++ -v` and `make -v` to see if your system already has them installed.

### Installing the theme

*[Jekyll documentation pages](https://jekyllrb.com/docs/)*

1. The Jekyll site provides detailed installation instructions for each operating system:
 
  - [Mac](https://jekyllrb.com/docs/installation/macos/)
  - [Linux distributions including Red Hat Linux](https://jekyllrb.com/docs/installation/other-linux)
  - [Ubuntu Linux](https://jekyllrb.com/docs/installation/ubuntu/)
  - [Windows](https://jekyllrb.com/docs/installation/windows/)
    
3. Fork this repository by clicking the _Fork_ button at the top right corner of this page.
4. Clone your fork (please ensure you have current version of git installed) by running: 
  `git clone git@github.com:YOUR_USER_NAME/community-theme.git`
5. Change into the project directory
  `cd community-theme`
6. Build the site and make it available on a local server
  `rake clean preview`
7. To preview your site, browse to http://localhost:4000

> If you encounter any unexpected errors during the above, please refer to the [troubleshooting](https://jekyllrb.com/docs/troubleshooting/#configuration-problems) page or the [requirements](https://jekyllrb.com/docs/installation/#requirements) page, as you might be missing development headers or other prerequisites.

_For more information regarding the use of Jekyll, please refer to the [Jekyll Step by Step Tutorial](https://jekyllrb.com/docs/step-by-step/01-setup/)._

### 1. Start the development webserver

In a new terminal initialized with the Docker host environment, start a Docker container that has the build environment for our website:

    $ docker run --privileged -it --rm -p 4000:4000 -e LC_ALL=C.UTF-8 -e LANG=C.UTF-8 -v $(pwd):/site uidoyen/newjekyll bash

This command tells Docker to start a container using the `uidoyen/newjekyll` image (downloading it if necessary) with an interactive terminal (via `-it` flag) to the container so that you will see the output of the process running in the container. The `--rm` flag will remove the container when it stops, while the `-p 4000` flag maps the container's 4000 port to the same port on the Docker host (which is the local machine on Linux or the virtual machine if running Boot2Docker or Docker Machine on OS X and Windows). The `-v $(pwd):/site` option mounts your current working directory (where the website's code is located) into the `/site` directory within the container.

Next, in the shell in the container, run the following commands to update and then (re)install all of the Ruby libraries required by the website:

    awestruct@49d06009e1fa:/site$ bundle update
    awestruct@49d06009e1fa:/site$ bundle install

This should only need to be performed once. After the libraries are installed, we can then build the site from the code so you can preview it in a browser:

    awestruct@49d06009e1fa:/site$ rake clean preview
    
With the integration with Antora, the above command will now also fetch the main codebase repository and will invoke the Antora build process to build the version-specific documentation prior to invoking Awestruct.  For information on Antora and how we've integrated it into the build process, please see ANTORA.md.

### 2. View the site

Point your browser to [http://localhost:4242](http://localhost:4242) to view the site. You may notice some delay during development, since the site is generated somewhat lazily.

## Deployment on GitHub Pages

To deploy your site using GitHub Pages you will need to add the [github-pages gem](https://github.com/github/pages-gem).

> Note that GitHub Pages runs in `safe` mode and only allows a set of [whitelisted plugins](https://help.github.com/articles/configuring-jekyll-plugins/#default-plugins).

To use the github-pages gem, you'll need to add the following on your `Gemfile`:

```
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```
And then run `bundle update`.

To deploy a project page that is kept in the same repository as the project they are for, please refer to the *Project Pages* section in [Deploying Jekyll to GitHub Pages](https://jekyllrb.com/docs/github-pages/#deploying-jekyll-to-github-pages).


## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on the process for submitting pull requests to us.

## Authors

* [**Adela Sofia A.**](https://github.com/adelasofia) - *Initial theme implementation*
* [**Jason Brock**](https://github.com/jkbrock) - *Visual Designer*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
