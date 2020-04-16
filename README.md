# Watch with me

Welcome to the Watch With Me repository.

## Extension

The extension can be found in the [./extension](./extension) folder.

Have fun!

## Devlopment

Before anything you should run `make install` in the root directory.

If you run into the following error `ERROR ENOENT: no such file or directory, mkdir` when install `pnpm` you can fix it by running:

```bash
sudo mkdir -p /usr/local/pnpm-global
sudo chown -R $(whoami) /usr/local/pnpm-global
```

(See https://github.com/pnpm/pnpm/issues/1909)
