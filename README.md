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
```

### Testing the connection

We use wscat to test socket connections. The url `wss://...` comes from the output of `sls deploy`.

```bash
wscat -c wss://i5wm2ocma6.execute-api.eu-west-3.amazonaws.com/dev -H Auth:secret
```
