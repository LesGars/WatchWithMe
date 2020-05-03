# Watch with me

Welcome to the Watch With Me repository.

## Extension

The extension can be found in the [./extension](./extension) folder.

Have fun!

## Development

Before anything you should run `make install` in the root directory.

### Troubleshoot

If you run into the following error `ERROR ENOENT: no such file or directory, mkdir` when running `make install` you can fix it by running:

```bash
sudo mkdir -p /usr/local/pnpm-global
sudo chown -R $(whoami) /usr/local/pnpm-global
```

(See https://github.com/pnpm/pnpm/issues/1909)

## Backend

We use the [serverless](https://github.com/serverless/serverless) framework to manage and deploy our serverless backend.

### Reference links

Serverless websockets: https://serverless.com/framework/docs/providers/aws/events/websocket/

### Install

#### Serverless

Run `make install` in root directory to install serverless

#### AWS CLI

```bash
    cd backend
    make intall-aws-cli-linux # or make intall-aws-cli-mac
    make configure # And then fill in your AWS Acces Key, AWS Secret Key, eu-west-3, json
```

#### Local development

To make sure that you can deploy your own version of the serverless stack to AWS without impacting on someone else branch, dev or prod use the Makefile command for deployment `make deploy` and for removal `make remove`.

They will check your current unix username with `id -un` and use that as the deployment stage.
ex: for me

```bash
$ id -un
michaelm
```

So If I run make deploy, a stage named michaelm will be used.

This implies

-   A new API Gateway stage named michaelm will be created
-   Functions will be deployed according to the naming convention watch-with-me-michaelm-function_name
-   A table named RoomTable-michaelm will be created.

### Useful commands

```bash
# Install serverless (not necessary if you've run make install in the main directory )
pnpm install -g serverless

# Deploying everything
serverless deploy
sls deploy # sls and is an alias of serverless
# Deploying only one service
sls deploy function -f function_name

# Logs the activity of a lambda. Very useful for debugging
sls logs -t -f default # or the name of the serverless function you want to log

# Remove all serverless services
sls remove

# Monitor all your lambda from the terminal
make monitor
```

### Testing the connection

We use wscat to test socket connections. The url `wss://...` comes from the output of `sls deploy`.

```bash
wscat -c wss://555x5rdnx6.execute-api.eu-west-3.amazonaws.com/dev -H Auth:secret
```
