[![Build Status](https://travis-ci.org/debezium/debezium.github.io.svg?branch=develop)](https://travis-ci.org/debezium/debezium.github.io)
[![License](http://img.shields.io/:license-apache%202.0-brightgreen.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Developer chat](https://img.shields.io/badge/chat-devs-brightgreen.svg)](https://gitter.im/debezium/dev)
[![Google Group](https://img.shields.io/:mailing%20list-debezium-brightgreen.svg)](https://groups.google.com/forum/#!forum/debezium)

# Introduction

This is the source code for the [Debezium website](https://debezium.io/). This is based on [templates](https://github.com/rhmwes/community-theme) created by the Red Hat Upstream Community using [Jekyll](https://jekyllrb.com/).

For publishing the Debezium reference documentation, the [Antora](https://antora.org/) tool is used,
which produces the documentation based on [AsciiDoc files](https://github.com/debezium/debezium/tree/master/documentation) in different branches of the Debezium main code repository.
The rendered HTML pages are added as-is to the website generated with Jekyll.
Please see [ANTORA.md](./ANTORA.md) to learn more.

# License

Contents of this repository are available as open source software under [Apache License Version 2.0](./LICENSE.txt).

# System Requirements

We use [Docker](http://docker.com) to build the site. Be sure you have a recent version of the [Docker Engine](http://docs.docker.com/engine/installation/) or [Docker Machine](http://docs.docker.com/toolbox).

# Getting Started

### 1. Get the site source code

Use Git to clone the Debezium website Git repository and change into that directory:

    $ git clone https://github.com/debezium/debezium.github.io.git
    $ cd debezium.github.io

If you plan to submit changes, fork the [Git repository](http://github.com/debezium/debezium.github.io) on GitHub and then add your fork as a remote:

    $ git remote rename origin upstream
    $ git remote add origin https://github.com/<you>/debezium.github.io.git

Then check out the `develop` branch and get the latest. If you're going to make changes, create a topic branch and make the changes there.

### 2. Start the development webserver

There are two recommended ways for previewing the website locally, either via the container environment that's also used on CI for publishing the website, or via a Jekyll install on your machine.
The latter is a bit quicker, but requires Ruby/Jekyll to be set up correctly, whereas you get this "for free" via the container image.

#### 2.1 Using the container image

In a new terminal initialized with the Docker host environment, start a Docker container that has the build environment for our website:

    $ docker run --privileged -it --rm -p 4000:4000 -e LC_ALL=C.UTF-8 -e LANG=C.UTF-8 -v $(pwd):/site debezium/website-builder bash

This command tells Docker to start a container using the `debezium/website-builder` image (downloading it if necessary) with an interactive terminal (via `-it` flag) to the container so that you will see the output of the process running in the container. The `--rm` flag will remove the container when it stops, while the `-p 4000` flag maps the container's 4000 port to the same port on the Docker host (which is the local machine on Linux or the virtual machine if running Boot2Docker or Docker Machine on OS X and Windows). The `-v $(pwd):/site` option mounts your current working directory (where the website's code is located) into the `/site` directory within the container.

Next, in the shell in the container, run the following commands to update and then (re)install all of the Ruby libraries required by the website:

    jekyll@49d06009e1fa:/site$ bundle update
    jekyll@49d06009e1fa:/site$ bundle install

This should only need to be performed once. After the libraries are installed, we can then build the site from the code so you can preview it in a browser:

    jekyll@49d06009e1fa:/site$ rake clean preview
    
With the integration with Antora, the above command will now also fetch the main codebase repository and will invoke the Antora build process to build the version-specific documentation prior to invoking Jekyll.  For information on Antora and how we've integrated it into the build process, please see ANTORA.md.

##### 2.2 Using a local Ruby and Jekyll installation

Run the following steps once to set up your local Jekyll installation.

* Install [RVM](https://rvm.io/), the Ruby version manager
(see [here](http://bootstrap.me.uk/2016/10/07/ruby-rvm-gemsets-and-bundler.html) why to use RVM _and_ Bundler).
* Install Ruby:

        rvm install ruby-2.7.2

* Create a _gemset_ for all the dependencies to be installed:

        rvm ruby-2.7.2 do rvm gemset create debezium.io

* Create a file named _.rvmrc_ in this directory (_debezium.github.io_) with the following contents:

        rvm use 2.7.2@debezium.io

* Change out of this directory and back in again, it should display a message like this:

        cd .. && cd debezium.github.io
        Using /Users/gunnar/.rvm/gems/ruby-2.7.2 with gemset debezium.io

* Install all dependencies

        bundle update
        bundle install

With this set-up in place, you can preview the website by running Jekyll like so:

    bundle exec jekyll serve --livereload --incremental

### 3. View the site

Point your browser to [http://localhost:4000](http://localhost:4000) to view the site. You may notice some delay during development, since the site is generated somewhat lazily.

### 4. Edit the site

Use any development tools on your local machine to edit the source files for the site.
Jekyll will detect the changes and may regenerate the corresponding static file(s).

If you have to change the Gemfile to use different libraries, you will need to let the container download the new versions. The simplest way to do this is to stop the container (using CTRL-C), use `rm -rf bundler` to remove the directory where the gem files are stored, and then restart the container. This ensures that you're always using the exact files that are specified in the Gemfile.lock file.

### 5. Commit changes

Use Git on your local machine to commit the changes to the site's codebase to your topic branch, and then create a pull request.

### 6. Publish the website

Review the pull request and merge onto the `develop` branch. The [GitHub Actions](https://github.com/features/actions) will then build the `develop` branch and, if successful, store the generated site in the `master` branch and publish to the GitHub Pages.