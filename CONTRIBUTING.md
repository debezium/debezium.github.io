## Contribute to Debezium's website

Our website is a community effort, and we welcome suggestions, fixes, improvements, and even new blog posts related to Debezium. The website is statically generated from [source code](https://github.com/debezium/debezium.io) using [Awestruct](http://awestruct.org) and [Bootstrap](http://twitter.github.com/bootstrap). This document outlines the basic steps require to get the latest source code for the website, modify it, test it locally, and create pull requests. And, yes, this process is intentionally very similar to how we [contribute code](https://github.com/debezium/debezium/blob/master/CONTRIBUTE.md).

### Talk to us

You can talk to us in our [chat room for developers](https://gitter.im/debezium/dev) or on our [Google Group](https://groups.google.com/forum/#!forum/debezium). We do [track our issues for the website](https://issues.jboss.org/issues/?jql=project%20%3D%20DBZ%20AND%20component%20%3D%20website), so please report any problems or suggestions even if you're going to propose a fix. No issue is required for new blog posts, though.

### Get set up

Before you can work on the website, you first need to get everything set up.

#### Install the tools

The following software is required to work with the Debezium website and build it locally:

* [Git 2.2.1](https://git-scm.com) or later
* [Docker Engine 1.9](http://docs.docker.com/engine/installation/) or later

See the links above for installation instructions on your platform. You can verify the versions are installed and running:

    $ git --version
    $ docker --version

#### GitHub account

Debezium uses [GitHub](GitHub.com) for its primary code repository and for pull-requests, so if you don't already have a GitHub account you'll need to [join](https://github.com/join).

#### Fork the Debezium website repository

Go to the [Debezium repository](https://github.com/debezium/debezium.io) and press the "Fork" button near the upper right corner of the page. When finished, you will have your own "fork" at `https://github.com/<your-username>/debezium.io`, and this is the repository to which you will push your proposed changes and create pull requests. For details, see the [GitHub documentation](https://help.github.com/articles/fork-a-repo/).

#### Clone your fork

Next, you need to get the code onto your local machine. At a terminal, go to the directory in which you want the code, and run the following command to use HTTPS authentication:

    $ git clone https://github.com/<your-username>/debezium.git

If you prefer to use SSH and have [uploaded your public key to your GitHub account](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/), you can instead use SSH:

    $ git clone git@github.com:<your-username>/debezium.git

This will create a `debezium.io` directory, so change into that directory:

    $ cd debezium.io

This repository knows about your fork, but it doesn't yet know about the official or ["upstream" Debezium.io repository](https://github.com/debezium/debezium.io). Run the following commands:

    $ git remote add upstream https://github.com/debezium/debezium.io.git
    $ git fetch upstream
    $ git branch --set-upstream-to=upstream/master master

Now, when you check the status using Git, it will compare your local repository to the *upstream* repository.

### Get the latest upstream code

You will frequently need to get all the of the changes that are made to the upstream repository, and you can do this with these commands:

    $ git fetch upstream
    $ git pull upstream master

The first command fetches all changes on all branches, while the second actually updates your local `master` branch with the latest commits from the `upstream` repository.

### Build and make changes

This section goes into detail about how you can build and edit the website locally using Docker, and how you can submit the changes via pull requests.

#### Building locally

To build the source code locally, checkout and update the `master` branch:

    $ git checkout master
    $ git pull upstream master

Then use Docker to run a container with the Awestruct tooling. Start a new terminal, configure it with the Docker environment (if required), and run the following command:

    $ docker run -it --rm -p 4242:4242 -v $(pwd):/site debezium/awestruct bash

This command will start a container using the `debezium/awestruct` Docker image, first downloading the image if necessary. It also mounts the current directory (where the website code is located) into the container's `/site` directory. 

Next, at the command line of that container run the following command:

    /site$ rm -rf _site/ ; bundle exec awestruct -d

This cleans up any previously-generated files in the `_site` directory, (re)generates the files for the website, and runs a local webserver to access the site by pointing your browser to http://localhost:4242[http://localhost:4242].

Note: If you're running Docker on Windows or OS X, you must use /docs/docker#port-forwarding[port forwarding] so that requests get forwarded properly to the Docker host virtual machine.

#### Changing the source

You can edit and change the source files at any time. For small modifications, Awestruct will often recognize the changes and then regenerate the affected static pages. However, this recognition may not work for additions, deletions, or even larger modifications. In this case, use CTRL-C to stop the Awestruct webserver in the Docker container, and rerun the same command:

    /site$ rm -rf _site/ ; bundle exec awestruct -d

#### Committing changes

Before you make any changes, be sure to switch to the `master` branch and pull the latest commits on the `master` branch from the upstream repository. Also, it's probably good to run a build and verify all tests pass *before* you make any changes.

    $ git checkout master
    $ git pull upstream master
    $ mvn clean install

Once everything builds, create a *topic branch* named appropriately (we recommend using the issue number, such as `DBZ-1234`):

    $ git checkout -b DBZ-1234

This branch exists locally and it is where you should make all of your proposed changes for the issue. As you'll soon see, it will ultimately correspond to a single pull request that the Debezium committers will review and merge (or reject) as a whole.

Feel free to commit your changes locally as often as you'd like, though we generally prefer that each commit represent a complete and atomic change to the code. Committing is as simple as:

    $ git commit .

which should then pop up an editor of your choice in which you should place a good commit message. _*We do expect that all commit messages begin with a line starting with the JIRA issue and ending with a short phrase that summarizes what changed in the commit.*_ For example:

    DBZ-1234 Corrected typo on community page.

Make sure you didn't break any other part of the website. 

#### Rebasing

If its been more than a day or so since you created your topic branch, we recommend *rebasing* your topic branch on the latest `master` branch. This requires switching to the `master` branch, pulling the latest changes, switching back to your topic branch, and rebasing:

    $ git checkout master
    $ git pull upstream master
    $ git checkout DBZ-1234
    $ git rebase master

If your changes are compatible with the latest changes on `master`, this will complete and there's nothing else to do. However, if your changes affect the same files/lines as other changes have since been merged into the `master` branch, then your changes conflict with the other recent changes on `master`, and you will have to resolve them. The git output will actually tell you you need to do (e.g., fix a particular file, stage the file, and then run `git rebase --continue`), but if you have questions consult Git or GitHub documentation or spend some time reading about Git rebase conflicts on the Internet.

### Creating a pull request

Once you're finished making your changes, your topic branch should have your commit(s) and you should have verified that your branch builds successfully. At this point, you can shared your proposed changes and create a pull request. To do this, first push your topic branch (and its commits) to your fork repository (called `origin`) on GitHub:

    $ git push origin DBZ-1234

Then, in a browser go to https://github.com/debezium/debezium.io, and you should see a small section near the top of the page with a button labeled "Create pull request". GitHub recognized that you pushed a new topic branch to your fork of the upstream repository, and it knows you probably want to create a pull request with those changes. Click on the button, and GitHub will present you with a short form that you should fill out with information about your pull request. The title should start with the JIRA issue and ending with a short phrase that summarizes the changes included in the pull request. (If the pull request contains a single commit, GitHub will automatically prepopulate the title and description fields from the commit message.) 

When completed, press the "Create" button and copy the URL to the new pull request. Go to the corresponding JIRA issue and record the pull request by pasting the URL into the "Pull request" field. (Be sure to not overwrite any URLs that were already in this field; this is how a single issue is bound to multiple pull requests.) Also, please add a JIRA comment with a clear description of what you changed. You might even use the commit message (except for the first line).

At this point, the Debezium committers will be notified of your new pull request, and will review it in short order. They may ask questions or make remarks using line notes or comments on the pull request. (By default, GitHub will send you an email notification of such changes, although you can control this via your GitHub preferences.)

If the reviewers ask you to make additional changes, simply switch to your topic branch for that pull request:

    $ git checkout DBZ-1234

and then make the changes on that branch and either add a new commit or ammend your previous commits. When you've addressed the reviewers' concerns, push your changes to your `origin` repository:

    $ git push origin DBZ-1234

GitHub will automatically update the pull request with your latest changes, but we ask that you go to the pull request and add a comment summarizing what you did. This process may continue until the reviewers are satisfied.

By the way, please don't take offense if the reviewers ask you to make additional changes, even if you think those changes are minor. The reviewers have a broach understanding of the codebase, and their job is to ensure the code remains as uniform as possible, is of sufficient quality, and is thoroughly tested. When they believe your pull request has those attributes, they will merge your pull request into the official upstream repository.

Once your pull request has been merged, feel free to delete your topic branch both in your local repository:

    $ git branch -d DBZ-1234

and in your fork: 

    $ git push origin :DBZ-1234

(This last command is a bit strange, but it basically is pushing an empty branch (the space before the `:` character) to the named branch. Pushing an empty branch is the same thing as removing it.)

### Site characteristics

When you build the site, the Awestruct tools will generate all of the static files for the site and place them into a local `_site` directory. These are the only files that will appear on the public website.

We want the site to have nice URLs, so Awestruct has an _indexer_ that will transform each file into a folder with the same root name as the file and placing the content into an `index.hmtl` inside that folder. For example, the content from the `/community.html.haml` source file is placed into the `_site/community/index.html` file, which can be viewed on the website with the URL `http://debezium.io/community`.

### Common changes

Some changes to the website are fairly common, so they're described here.

#### Add a blog post

Anyone can write a blog post that is related to Debezium. Simply add a new AsciiDoc file to the `blog` directory, including the date in the filename using the same format as the other files (e.g., "2016-03-18-title-of-blog-post.adoc"). The file should also contain a header like the following:

    = Title Of Blog Post
    rhauch
    :awestruct-tags: [ mysql, sql ]
    :awestruct-layout: blog-post

The second line is the key to an entry in the `_config/authors.yml` file, so the first time be sure to add an entry for yourself (avatar images go in the `images` directory). Specify the appropriate lowercase tags, surrounding multi-word tags with double quotes. The `:awestruct-layout` line should remain the same.

Then, rebuild the site and make sure your post is formatted correctly and appears in the [blog](http://debezium.io/blog/).

#### Releasing software

When a release is made, write a blog post and update the `_config/releases.yml` file. The site will use that file to automatically generate the information for the releases.

#### Edit documentation

All of the source files for the site's [docs](http://debezium.io/docs/) are in the `docs` directory, which is structured identically to the URLs of the site (although the source files are _indexified_ as described above). Most of the time you will simply edit one of the existing files. If you want to add a new file, however, be sure that it is referenced in the [docs](http://debezium.io/docs/) table of contents defined in the `_partials/leftcol-doc.html.haml` file.

#### Update the front page

The site's main page is located in the `/index.html.haml` file.

### Summary

Here's a quick check list for a good pull request (PR):

* Discussed and approved on IRC or the mailing list
* A JIRA associated with your PR (include the JIRA issue number in commit comment)
* One commit per PR
* One feature/change per PR
* No changes not directly related to your change (e.g. no formatting changes or refactoring to existing code, if you want to refactor/improve existing code that's a separate discussion and separate JIRA issue)
* A full build completes succesfully
* Do a rebase on upstream `master`