# Antora Integration

Debezium now makes use of the [Antora framework](http://www.antora.org) to build parts of website documentation.  The Antora framework is bundled as part of the published `debezium/website-builder` docker image found on Docker hub that this repository uses for building the site's contents.

## How it works

The build process now includes one additional step prior to calling Jekyll, which is to call:

```
antora playbook.yml
```

The `playbook.yml` file is what describes to Antora where and how the documentation should be rendered.  More information on this file's structure can be found [here](https://docs.antora.org/antora/2.1/playbook/).

## Antora UI 

The Debezium Antora integration currently uses the [antora-default-ui](https://gitlab.com/antora/antora-ui-default) with some minor changes.  In this repository there is a directory called `_antora_\supplemental_ui` where the Antora UI specific overrides are provided.  In short, any file from the default-ui bundle can be overwritten with a new, customized version by using the default-ui layout structure and providing our own custom file to replace the default implementation.

## Running Antora manually

There are times where one may find it useful to regenerate just the Antora documentation while running the website in preview mode.

You must first start the docker container for previewing the website, as described in this [README section](./README.md#22-using-the-container-image---generate-debezium-docs-from-local-repo).  If you want Antora to generate docs from your local Debezium repo, it is **important** to include the volume mapping for the local Debezium repo as described.

To run Antora manually, simply open a bash session to the already running website-builder container:

```
docker exec -it website-builder bash
```

Once in the container, navigate to the `/site` directory.

To regenerate the documentation from the local checked-out copy of the Debezium repo (author mode), enter the following.


```
antora playbook_author.yml
```

To regenerate the documentation by cloning the remote Debezium repository from GitHub, enter the following:


```
antora playbook.yml
```

## Release process

What is important for the release process is to make sure that the `playbook.yml` file references the correct branches or tags for building the Debezium documentation on GitHub pages that also aligns with the displayed series (See CONTRIBUTING.md for more details on series configuration). For example, if series `0.8`, `0.9`, and `0.10` are all displayed, then Antora should technically be building 3 differing combinations of either branches or tags.

In `playbook.yml`, the `content` section is what drives what branch/tags will be rendered.


```yaml
content:
  sources:
    - url: https://github.com/debezium/debezium.git
      start_path: documentation
      branches:
        - 'main'
        - '0.9'
        - '0.8'
```

In this example, Antora will build documentation from 3 branches, `master`, `0.9`, and `0.8`.

Similarly, tags could also be used in conjunction with or without the branches as follows:

```yaml
content:
  sources:
    - url: https://github.com/debezium/debezium.git
      start_path: documentation
      branches: 
        - 'main'
      tags:
        - '0.9.5.Final'
        - '0.8.3.Final'
```

_NOTE: It's important that if the `url` given in the content sources is to GitHub that it be `https://github.com/...` and not `https://www.github.com/...` as there is a known problem with isomorphic-git that doesn't return the right information and causes Antora not to properly fetch the remote repository._ 

When adding the blog post about the new release, this would be the ideal time to:

1. Add the `series.yml` file if applicable (See CONTRIBUTING.md for more details)
2. Add the `fully-qualified-version.yml` file (See CONTRIBUTING.md for more details)
3. Align `playbook.yml` to the correct branches/tags
