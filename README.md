# Watch with me

Welcome to the Watch With Me repository.

## Extension

The extension can be found in the [./extension](./extension) folder.

Have fun!

## Backend

We use the [serverless](https://github.com/serverless/serverless) framework to manage and deploy our serverless backend.

### Useful commands

```bash
# Install serverless
pnpm install -g serverless

# Deploying everything
serverless deploy
sls deploy # sls and is an alias of serverless
# Deploying only one service
sls deploy function -f function_name

# Logs the activity of a lambda. Very useful for debugging
sls logs -t -f function_name

# Remove all serverless services
sls remove
```

## Development

Before anything you should run `make install` in the root directory.

### Troubleshoot

If you run into the following error `ERROR ENOENT: no such file or directory, mkdir` when running `make install` you can fix it by running:

```bash
sudo mkdir -p /usr/local/pnpm-global
sudo chown -R $(whoami) /usr/local/pnpm-global
```

(See https://github.com/pnpm/pnpm/issues/1909)
