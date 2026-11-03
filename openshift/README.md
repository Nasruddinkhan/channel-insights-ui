# OpenShift deployment

These files deploy `docker.io/nasruddinkhan/channel-insights-ui:local` in `nasruddinkhan786-dev`.

- `configmap.yml`: Nginx configuration for an arbitrary non-root UID, port 8080, writable temporary paths, SPA routes and JSON assets.
- `deployment.yml`: one replica, resource limits, health probes and a read-only root filesystem. It does not request root or privileged access.
- `service.yml`: ClusterIP Service exposing port 80 and forwarding to container port 8080.
- `route.yml`: HTTPS edge Route, with HTTP redirected to HTTPS. OpenShift assigns the hostname and uses its router's default certificate.

The Deployment starts `nginx` directly with the mounted configuration, so the existing image's root-oriented entrypoint and port-80 configuration are bypassed. Static frontend files remain in the image. A writable `emptyDir` at `/tmp` holds temporary Nginx files; this application does not require a persistent volume. The Tekton build workspace PVC is separate.

## Apply from a terminal

Ensure the image is pushed to Docker Hub. Reuse the registry Secret already created for Tekton, in the same namespace. If it is not installed yet:

```sh
oc apply -f tekton/registry-secret.yaml
```

Then deploy:

```sh
oc apply -f openshift/
oc rollout status deployment/channel-insights-ui -n nasruddinkhan786-dev
oc get route channel-insights-ui -n nasruddinkhan786-dev
```

Open `https://` followed by the Route's reported hostname. Do not commit registry credentials.

## OpenShift web console

Select project `nasruddinkhan786-dev`. Use **+Add → Import YAML** to import `configmap.yml`, `deployment.yml`, `service.yml`, then `route.yml`. Ensure the `registry-auth` Secret exists. Open **Networking → Routes → channel-insights-ui** and follow its location.

## Updating the deployment

The image uses the mutable `local` tag and `imagePullPolicy: Always`. After pushing a replacement image, restart the Deployment to pull it:

```sh
oc rollout restart deployment/channel-insights-ui -n nasruddinkhan786-dev
oc rollout status deployment/channel-insights-ui -n nasruddinkhan786-dev
```

Restart after ConfigMap changes as well; Nginx does not automatically reload mounted configuration. For versioned releases, change the Deployment's image to a unique tag or digest.

All resources explicitly target `nasruddinkhan786-dev`. Change their namespaces together for another project. No cluster-level permissions or SCC changes are included.
