# Tekton image pipeline

Four separate Tasks run in order:

1. `git-clone`: checks out the selected Git revision.
2. `npm-install`: runs `npm ci`, then `npm run build` (including TypeScript checks).
3. `docker-build`: uses Buildah to build the Nginx image from `dist/`, then exports it to `image.tar` on the PVC.
4. `docker-push`: uses Skopeo to push the saved image to Docker Hub.

The npm build runs once. `docker/Dockerfile.ci` packages its output; the original root Dockerfile remains available for standalone Docker builds. Buildah and Skopeo do not need a Docker daemon.

## Requirements

- Tekton Pipelines supporting `tekton.dev/v1` and a Kubernetes namespace in which all resources below are created.
- A default StorageClass capable of provisioning the ReadWriteOnce PVC, or an explicit `storageClassName` in `workspace-pvc.yaml`.
- The Buildah step runs without privileged mode, as UID 0 with the SETFCAP capability. Its service account must have an SCC permitting these settings, such as a compatible pipelines-scc. The reported admission error showed pipelines-scc was usable but rejected privileged mode. Fully restricted namespaces may still need an administrator-approved build setup. These files do not change SCC permissions.
- Outbound access to GitHub, npm, Docker Hub and Quay.
- The Git repository must be readable over HTTPS. Private repositories need additional Git credentials in the clone Task; the registry secret does not authenticate Git.
- A Docker Hub access token with write access to `nasruddinkhan/channel-insights-ui`.

Commit and push the CI Dockerfile and ignore file before starting a run; the pipeline clones the remote branch, not your local folder.

## Docker registry Secret YAML

Copy the template:

```sh
cp tekton/registry-secret.example.yaml tekton/registry-secret.yaml
```

Generate the `auth` value from `username:token`:

```sh
printf '%s' 'nasruddinkhan:YOUR_DOCKER_HUB_TOKEN' | base64 | tr -d '\n'
```

Replace `REPLACE_WITH_BASE64_USERNAME_COLON_TOKEN` in your local `registry-secret.yaml` with that output. The outer `.dockerconfigjson` field uses `stringData`, so the entire JSON does not need another base64 encoding. The populated file is ignored by Git and Docker. Base64 is not encryption; keep the actual token and file private.

```sh
kubectl apply -f tekton/registry-secret.yaml
```

Only the push Task receives this secret. An existing secret of type `kubernetes.io/dockerconfigjson` named `registry-auth` also works.

## Persistent workspace

`workspace-pvc.yaml` declares a 5Gi ReadWriteOnce PVC named `channel-insights-workspace`. The PipelineRun binds every Task to that PVC. Each run uses its own subdirectory, named after its PipelineRun, containing the checkout, `node_modules`, `dist` and `image.tar`.

Run one pipeline at a time with this ReadWriteOnce claim. For concurrent runs on different nodes, provision a separate PVC per run or use storage that supports ReadWriteMany. Retained run directories consume disk; remove old directories when they are no longer needed. This explicit PVC remains after runs are deleted.

## Apply and run

From the repository root, using the same Kubernetes namespace throughout:

```sh
kubectl apply -f tekton/workspace-pvc.yaml
kubectl apply -f tekton/tasks/
kubectl apply -f tekton/pipeline.yaml
kubectl create -f tekton/pipeline-run.yaml
```

Use `create` for each new run because `generateName` creates a unique PipelineRun.

```sh
kubectl get pvc channel-insights-workspace
kubectl get pipelineruns
# Substitute the generated name:
tkn pipelinerun logs <PIPELINE_RUN_NAME> -f
```

Edit `revision` and `image` in `pipeline-run.yaml` to build a different revision or tag. The defaults are `codex/channel-insights-dashboard` and `docker.io/nasruddinkhan/channel-insights-ui:local`. This builds for the cluster node architecture; it does not build a multi-architecture image or deploy the dashboard.

Builder image tags use `latest` for portability. Pin approved image digests in your CI environment.

## Install all resources together

`install.yaml` combines the four Tasks, Pipeline and PVC with `metadata.namespace: nasruddinkhan786-dev` on every resource. Import this file using OpenShift **+Add → Import YAML**, or apply it from an authenticated terminal:

```sh
kubectl apply -f tekton/install.yaml
kubectl get tasks -n nasruddinkhan786-dev
```

This bundle does not contain registry credentials. Apply the local registry Secret separately in that namespace, then create a new PipelineRun. The bundle is a snapshot of the individual manifests; regenerate it if they change.
