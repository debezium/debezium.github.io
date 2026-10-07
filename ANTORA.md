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

How the playbooks change for a release (which branches are built, and which versions are labelled stable and devel) is described with the rest of the release steps in [RELEASE_PROCESS.md](./RELEASE_PROCESS.md#the-antora-playbooks).
