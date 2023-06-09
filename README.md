# Roles Microservice for [Ivi Clone backend](https://github.com/srgklmv/ivi-clone-repo)

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</p>


## Description

This microservice is a part of [Ivi Clone backend application](https://github.com/srgklmv/ivi-clone-repo).
Here you can find an instructions for setting up and running microservice.

If you found this repo before exploring the [main repo](https://github.com/srgklmv/ivi-clone-repo),
I recommend you to explore [main repo](https://github.com/srgklmv/ivi-clone-repo) firstly for understanding how to run the application.

## Requirements
- Postgres
- RabbitMQ
- NodeJs, npm

## Installation

```bash
$ npm i
```

> Note: If you downloaded this repo from main repo script, there is no need to run install command.

## Setting up & running service

### For localhost

1. Create database named **roles** using Postgres.
2. Set up **.dev.env** file.
3. Run service!

```bash
# watch mode
$ npm run start:dev
```

### For Docker
> There is no need to set up service for using in Docker. You can continue follow main repo instructions.

## Test
Create database 'roles_tests' in Postgres. The database credentials from .dev.env file will be used.
```bash
# unit tests
$ npm run test

```

## Author
[Vladimir Andreev](https://github.com/JcJet)
## Description



