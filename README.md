# How to Dockerize and Deploy a GraphQL Server with Fly

[Express GraphQL](https://github.com/graphql/express-graphql/) is a library for building production ready GraphQL HTTP middleware. Despite the emphasis on Express in the repo name, you can create a GraphQL HTTP server with any HTTP web framework that supports connect styled middleware. This includes [Connect](https://github.com/senchalabs/connect) itself, [Express](https://expressjs.com) and [Restify](http://restify.com/).

[Docker](https://www.docker.com/) is a set of tools that use OS-level virtualization to deliver software in isolated packages called containers. Containers bundle their own software, libraries and configuration files. [Fly](https://fly.io/) is a platform for full stack applications and databases that need to run globally. You can run arbitrary Docker containers and host popular databases like Postgres.

## GraphQL Express Server in `index.js`

`graphqlHTTP` accepts a wide range of options, some of the most common include:

- **`schema`** - A `GraphQLSchema` instance from `GraphQL.js`
- **`rootValue`** - A value to pass as the `rootValue` to the `execute()` function
- **`graphiql`** - If passed `true` or an options object it will present GraphiQL when the GraphQL endpoint is loaded in a browser
- **`headerEditorEnabled`** - Optional boolean which enables the header editor when `true`

```js
// index.js

const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`type Query { hello: String }`)
const rootValue = { hello: () => 'Hello from Express GraphQL!' }

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: {
      headerEditorEnabled: true
    },
  }),
)

app.listen(8080, '0.0.0.0')

console.log('Running Express GraphQL server at http://localhost:8080/graphql')
```

### Run server and execute test query

```bash
node index.js
```

```
Running Express GraphQL server at http://localhost:8080/graphql
```

`express-graphql` will accept requests with the parameters:

- **`query`** - A string GraphQL document to be executed
- **`variables`** - The runtime values to use for any GraphQL query variables as a JSON object
- **`operationName`** - Specifies which operation should be executed if the provided `query` contains multiple named operations

```graphql
query HELLO_QUERY { hello }
```

![01-express-graphql-hello-localhost-8080](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6tb9ltduj8k6lfiwwwb9.png)

```bash
curl --request POST \
  --url http://localhost:8080/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```

## `Dockerfile`

Docker can build images automatically by reading the instructions from a [`Dockerfile`](https://docs.docker.com/engine/reference/builder/). A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. Using `docker build` users can create an automated build that executes several command-line instructions in succession.

```dockerfile
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-express-graphql-docker
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . ./
EXPOSE 8080
CMD [ "node", "index.js" ]
```

## Docker Compose

[Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container Docker applications. After configuring your application???s services with a YAML file, you can create and start all your services with a single command. Define the services that make up your app in `docker-compose.yml` so they can be run together in an isolated environment.

```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "49160:8080"
```

### Create and start containers with `docker compose up`

The `docker compose up` command aggregates the output of each container. It builds, (re)creates, starts, and attaches to containers for a service.

```bash
docker compose up
```

```
Attaching to web_1
web_1  | Running Express GraphQL server at http://localhost:8080/graphql
```

Docker mapped the `8080` port inside of the container to the port `49160` on your machine. Open [localhost:49160/graphql](http://localhost:49160/graphql) and send a hello query.

```graphql
query HELLO_QUERY { hello }
```

![02-localhost-49160-graphql](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bpim4bg6oi7z09r4w3hw.png)

```bash
curl --request POST \
  --url http://localhost:49160/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```

## Deploy to Fly

### Install and authenticate `flyctl` CLI

You can download the CLI on [Mac, Linux, or Windows](https://fly.io/docs/getting-started/installing-flyctl/).

```bash
brew install superfly/tap/flyctl
```

If you are a new user you can create an account with `flyctl auth signup`.

```bash
flyctl auth signup
```

You will also be prompted for credit card payment information, required for charges outside the free plan on Fly. See [Pricing](https://fly.io/docs/about/pricing) for more details. If you already have an account you can login with `flyctl auth login`.

```bash
flyctl auth login
```

### Launch app on Fly with `flyctl launch`

Run `flyctl launch` in the directory with your source code to configure your app for deployment. This will create and configure a fly app by inspecting your source code and prompting you to deploy.

```bash
flyctl launch \
  --name ajcwebdev-express-graphql-docker \
  --region sjc
```

This creates a `fly.toml` file.

```toml
app = "ajcwebdev-express-graphql-docker"

kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]

[experimental]
  allowed_public_ports = []
  auto_rollback = true

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

[services.concurrency]
  hard_limit = 25
  soft_limit = 20
  type = "connections"

[[services.ports]]
  handlers = ["http"]
  port = 80

[[services.ports]]
  handlers = ["tls", "http"]
  port = 443

[[services.tcp_checks]]
  grace_period = "1s"
  interval = "15s"
  restart_limit = 6
  timeout = "2s"
```

Add the following `PORT` number under `env`.

```toml
[env]
  PORT = 8080
```

### Deploy application with `flyctl deploy`

```bash
flyctl deploy
```

### Show the application's current status with `flyctl status`

Status includes application details, tasks, most recent deployment details and in which regions it is currently allocated.

```bash
flyctl status
```

Visit [ajcwebdev-express-graphql-docker.fly.dev/graphql](https://ajcwebdev-express-graphql-docker.fly.dev/graphql) to see the site and run a test query.

```graphql
query HELLO_QUERY { hello }
```

![03-ajcwebdev-express-graphql-docker-fly-dev-hello](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/e7ab8m96y7j8frtxnwg8.png)

```bash
curl --request POST \
  --url https://ajcwebdev-express-graphql-docker.fly.dev/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```
