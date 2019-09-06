[![Build Status](https://travis-ci.org/debezium/debezium.github.io.svg?branch=develop)](https://travis-ci.org/debezium/debezium.github.io)
[![License](http://img.shields.io/:license-CC%20BY%203.0-brightgreen.svg)](http://creativecommons.org/licenses/by/3.0/)
[![Developer chat](https://img.shields.io/badge/chat-devs-brightgreen.svg)](https://gitter.im/debezium/dev)
[![Google Group](https://img.shields.io/:mailing%20list-debezium-brightgreen.svg)](https://groups.google.com/forum/#!forum/debezium)

# Introduction

This is the source code for the [Debezium website](https://debezium.io/). This is based on [templates](https://github.com/jbossorg/bootstrap-community) created by the JBoss Community using [Awestruct](http://awestruct.org/) and [Bootstrap](http://twitter.github.com/bootstrap).

# License

Contents of this repository are available as open source software under [Apache License Version 2.0](./LICENSE.txt).

# System Requirements

We use [Docker](http://docker.com) to build the site. Be sure you have a recent version of the [Docker Engine](http://docs.docker.com/engine/installation/) or [Docker Machine](http://docs.docker.com/toolbox).

# Getting Started

### 1. Get the site source code

Use Git to clone the Debezium website Git repository and change into that directory:

    $ git clone https://github.com/debezium/debezium.io.git
    $ cd debezium.io

If you plan to submit changes, fork the [Git repository](http://github.com/debezium/debezium.io) on GitHub and then add your fork as a remote:

    $ git remote rename origin upstream
    $ git remote add origin https://github.com/<you>/debezium.io.git

Then check out the `develop` branch and get the latest. If you're going to make changes, create a topic branch and make the changes there.

### 2. Start the development webserver

In a new terminal initialized with the Docker host environment, start a Docker container that has the build environment for our website:

    $ docker run -it --rm -p 4242:4242 -e LC_ALL=C.UTF-8 -e LANG=C.UTF-8 -v $(pwd):/site debezium/awestruct bash

This command tells Docker to start a container using the `debezium/awestruct` image (downloading it if necessary) with an interactive terminal (via `-it` flag) to the container so that you will see the output of the process running in the container. The `--rm` flag will remove the container when it stops, while the `-p 4242` flag maps the container's 4242 port to the same port on the Docker host (which is the local machine on Linux or the virtual machine if running Boot2Docker or Docker Machine on OS X and Windows). The `-v $(pwd):/site` option mounts your current working directory (where the website's code is located) into the `/site` directory within the container (where Awestruct expects to find it). The `bash` command tells the container to start a bash shell.

Next, in the shell in the container, run the following commands to remove and then (re)install all of the Ruby libraries required by the website:

    awestruct@49d06009e1fa:/site$ rm -rf ./.bundle/
    awestruct@49d06009e1fa:/site$ bundle install

This should only need to be performed once. After the libraries are installed, we can then build the site from the code so you can preview it in a browser:

    awestruct@49d06009e1fa:/site$ rake clean preview
    
With the integration with Antora, the above command will now also fetch the main codebase repository and will invoke the Antora build process to build the version-specific documentation prior to invoking Awestruct.  For information on Antora and how we've integrated it into the build process, please see ANTORA.md.

### 3. View the site

Point your browser to [http://localhost:4242](http://localhost:4242) to view the site. You may notice some delay during development, since the site is generated somewhat lazily.

### 4. Edit the site

Use any development tools on your local machine to edit the source files for the site. For very minor modifications, Awestruct will detect the changes and may regenerate the corresponding static file(s). However, we generally recommend that you use CNTRL-C in the container shell to stop the preview server, re-run the `rake clean preview` command, and refresh your browser.

If you have to change the Gemfile to use different libraries, you will need to let the container download the new versions. The simplest way to do this is to stop the container (using CTRL-C), use `rm -rf bundler` to remove the directory where the gem files are stored, and then restart the container. This ensures that you're always using the exact files that are specified in the Gemfile.lock file.

### 5. Commit changes

Use Git on your local machine to commit the changes to the site's codebase to your topic branch, and then create a pull request.

### 6. Publish the website

Review the pull request and merge onto the `develop` branch. The [Travis-CI build](https://travis-ci.org/debezium/debezium.github.io) will then build the `develop` branch and, if successful, store the generated site in the `master` branch and publish to the GitHub Pages.
