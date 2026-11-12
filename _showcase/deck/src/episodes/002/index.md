---
theme: debezium
_class: lead
paginate: true
footer: _
---

<!-- _class: lead -->

```episode
number: 002
date: November 2026
day: 17
youtube: Q46slutMeSA
special: gsoc2026 | GSoC 2026 Projects Showcase
```

---

```intro
```

---

```agenda
```

---

```speaker special
```

---

## Debezium

### Source Connector for Milvus

<div style="display:flex;flex-direction:column;gap:18px;margin-top:24px;">
    <div style="display:flex;align-items:center;gap:18px;">
        <img src="/assets/images/kartik.jpg" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--dbz-accent);flex-shrink:0;" />
    <div>
    <div style="font-weight:700;font-size:0.95em;color:var(--dbz-text);">Kartik Angiaris</div>
        <div style="color:var(--dbz-muted);font-size:0.72em;">GSoC Student</div>
        </div>
    </div>
</div>

---

## What is Milvus


---

## What is Milvus

---

## Working on Milvus

---

## Complexity of Milvus

---

## Why and Use Cases

---

## Pipeline Demo

---

## Pipeline Demo

---

## What’s next

---

## Debezium

### Source Connector for SQLite

<div style="display:flex;flex-direction:column;gap:18px;margin-top:24px;">
    <div style="display:flex;align-items:center;gap:18px;">
        <img src="/assets/images/siddhant.jpeg" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--dbz-accent);flex-shrink:0;" />
    <div>
    <div style="font-weight:700;font-size:0.95em;color:var(--dbz-text);">Siddhant Chaturvedi</div>
        <div style="color:var(--dbz-muted);font-size:0.72em;">GSoC Student</div>
        </div>
    </div>
</div>

---

## SQLite is everywhere, but it can't tell you what changed

---

## SQLite is everywhere, but it can't tell you what changed


---

## SQLite is everywhere, but it can't tell you what changed


---

## The Road to v1

---

## SQLite has no change log, so the connector makes one


---

## The Complete Pipeline


---

## Plain SQL in, Debezium events out - A Small Demo of the Work

---

## What’s Next for the SQLite Connector

---

## Debezium

### Host-Based Deployment for Debezium Platform

<div style="display:flex;flex-direction:column;gap:18px;margin-top:24px;">
    <div style="display:flex;align-items:center;gap:18px;">
        <img src="/assets/images/divyanshu.jpg" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--dbz-accent);flex-shrink:0;" />
    <div>
    <div style="font-weight:700;font-size:0.95em;color:var(--dbz-text);">Divyanshu Kumar</div>
        <div style="color:var(--dbz-muted);font-size:0.72em;">GSoC Student</div>
        </div>
    </div>
</div>

---

## Host-Based Pipeline Deployment

<style scoped>
h2 {
  font-size: 34px;
  margin-bottom: 12px;
  padding-bottom: 8px;
}
p {
  font-size: 20px;
  line-height: 1.3;
  margin: 8px 0;
}
.wide-narrow {
  gap: 22px;
}
.card {
  padding: 12px 18px;
  font-size: 0.76em;
}
.card h3 {
  font-size: 24px;
  margin: 4px 0 6px;
}
.diagram {
  margin: 4px 0 0;
}
</style>

Host deployment adds SSH-managed Linux machines as deployment targets for Debezium Platform pipelines.

<div class="wide-narrow">
<div>

Stage and the Platform API keep the same pipeline model. Conductor can now place the generated Debezium Server container on a selected virtual machine, bare-metal server, or cloud instance.

The existing Kubernetes and Operator path remains available.

</div>
<div class="card accent">

### Configuration

```properties
pipeline.deployment.mode=host
```

The setting selects the host deployment path for the pipeline.

</div>
</div>

<div class="diagram">
<img src="/assets/images/2026-11-16-host-based-pipeline-deployment/architecture-overview.svg" style="display:block;height:260px;width:100%;max-width:100%;margin:0 auto;object-fit:contain;" />
</div>

---

## Teams do not always operate Kubernetes

<div class="cols-3">
<div class="card accent">

### Kubernetes users

Continue using the existing Platform and Operator deployment path.

</div>
<div class="card brand">

### Linux host operators

Deploy Debezium Server to a virtual machine, bare-metal machine, or cloud instance through SSH.

</div>
<div class="card">

### Shared pipeline model

Stage and the Platform API define pipelines. Conductor selects the deployment environment and manages the lifecycle.

</div>
</div>

> Host mode removes the need to operate a Kubernetes cluster. The operator remains responsible for SSH access, the host operating system, capacity, and maintenance.

---

## From an SSH entry to a confirmed CDC event

<div class="cols">
<div class="card accent">

### Developer machine

Docker Compose starts Stage, Conductor, the Conductor database, PostgreSQL source, and HTTP receiver.

Conductor reads a dedicated SSH configuration and discovers the `host-example` entry.

</div>
<div class="card brand">

### Disposable Multipass VM

Ansible connects to the VM, prepares Docker, and manages the Debezium Server container.

</div>
</div>

<div class="cols-3">
<div class="card accent">

### Host READY

Conductor discovered and provisioned the VM.

</div>
<div class="card brand">

### Deployment RUNNING

Conductor created the Debezium Server container.

</div>
<div class="card warn">

### CDC event received

A new PostgreSQL row reached the HTTP receiver.

</div>
</div>

---

## Current boundaries and future direction

<div class="cols">
<div>

### Current scope

<div class="card accent">

#### Kubernetes remains supported

Host deployment adds another target. Teams can continue using the Platform and Operator path with Kubernetes.

</div>

<div class="card warn">

#### The host stays under operator control

Ansible prepares Docker and runs Debezium Server. The operator controls SSH access, the host operating system, secrets, network policy, and capacity.

</div>

</div>
<div>

### Future direction

<div class="card brand">

#### Publish the Host Agent artifact

Agent mode already works. Until its Uber JAR is published to Maven Central, users host it in an accessible Maven repository and configure its version and repository URL.

</div>

<div class="card">

#### Monitoring and placement can grow

Future work can add host health in Stage, richer monitoring, and placement rules for installations with several available hosts.

</div>

</div>
</div>

---

## Debezium

### Debezium CLI

<div style="display:flex;flex-direction:column;gap:18px;margin-top:24px;">
    <div style="display:flex;align-items:center;gap:18px;">
        <img src="/assets/images/gsoc.png" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--dbz-accent);flex-shrink:0;" />
    <div>
    <div style="font-weight:700;font-size:0.95em;color:var(--dbz-text);">Binayak Das</div>
        <div style="color:var(--dbz-muted);font-size:0.72em;">GSoC Student</div>
        </div>
    </div>
</div>

---

## Debezium CLI


---

## CDC tooling was scattered

---

## Build: from dbz.yaml to an image, no Docker


---

## Platform: operate pipelines from your terminal

---

## Watch it run: from scaffold to running pipeline

---

## The road ahead for the CLI

---

