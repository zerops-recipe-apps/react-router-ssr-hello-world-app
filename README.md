# React Router v8 SSR Hello World Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
A minimal SSR application built with React Router v8, connecting to a PostgreSQL database on Zerops.
Demonstrates server-side rendering, idempotent database migrations, and a zero-downtime production
deploy pipeline.
<!-- #ZEROPS_EXTRACT_END:intro# -->

Used within [React Router v8 SSR Hello World recipe](https://app.zerops.io/recipes/react-router-ssr-hello-world) for [Zerops](https://zerops.io) platform.

⬇️ **Full recipe page and deploy with one-click**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/react-router-ssr-hello-world?environment=small-production)

![react-router cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-react-router.svg)

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yaml`

The main application configuration file you place at the root of your repository. It tells Zerops how to build, deploy, and run your application.

```yaml
# React Router v8 SSR hello world recipe for Zerops.
# Two setups: 'prod' for production/stage deployments,
# 'dev' for SSH-based interactive development.
zerops:
  - setup: prod
    build:
      base: nodejs@22
      # Alpine lacks the glibc Rollup binary needed by Vite/React Router.
      # Ubuntu provides the glibc variant. Runtime deps (pg,
      # react-router-serve) are pure JS - they run fine on the
      # Alpine runtime container below.
      os: ubuntu
      buildCommands:
        # npm ci installs exact locked versions for reproducible builds.
        - npm ci
        - npm run build
      deployFiles:
        # React Router v8 is NOT self-contained - the server bundle
        # requires node_modules at runtime (unlike Nitro-based
        # frameworks that bundle all deps into a single output dir).
        - build
        - node_modules
        - package.json
        # Migration script runs in initCommands, not buildCommands,
        # so it must be deployed alongside the application code.
        - migrate.js
      cache:
        # Cache node_modules between builds so npm ci only fetches
        # changed packages, not the entire dependency tree.
        - node_modules

    deploy:
      # Readiness check: Zerops starts a new runtime container,
      # waits for this HTTP check to pass, then routes traffic from
      # the project balancer - zero-downtime deployment by default.
      readinessCheck:
        httpGet:
          port: 3000
          path: /

    run:
      base: nodejs@22
      initCommands:
        # Migrations run here (not buildCommands) so schema changes
        # deploy atomically with the application code. If the deploy
        # fails after migration, the old code still matches the old
        # schema. zsc execOnce ensures exactly one container runs the
        # migration per version even when minContainers > 1.
        - zsc execOnce ${appVersionId} -- node migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: production
        # DB_NAME is the PostgreSQL database name, which matches
        # the service hostname in Zerops by convention.
        DB_NAME: db
        # ${db_hostname} references the generated env var for the
        # 'db' service - resolved by Zerops at deploy time using
        # the {hostname}_{key} pattern.
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      start: npm run start

  - setup: dev
    build:
      base: nodejs@22
      # Ubuntu for richer SSH toolset - curl, vim, git all available
      # without extra prepareCommands.
      os: ubuntu
      buildCommands:
        # npm install (not ci) - dev environment may have uncommitted
        # or absent lock file during initial setup.
        - npm install
      # Deploy full source code so the developer can edit files,
      # run the dev server, and iterate without rebuilding the image.
      deployFiles: ./
      cache:
        - node_modules

    run:
      base: nodejs@22
      os: ubuntu
      initCommands:
        # Same migration as prod - database is ready when you SSH in.
        - zsc execOnce ${appVersionId} -- node migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: development
        # PORT=3000 so `npm run dev` binds to the expected port.
        PORT: "3000"
        DB_NAME: db
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      # Container stays idle - developer connects via SSH and drives
      # the dev server manually: `npm run dev`
      start: zsc noop --silent
```

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
