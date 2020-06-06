help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install-deps: ## Install/Update global packages
	npx pnpm add -g pnpm
	pnpm install -g serverless
	pnpm install -g wscat

install: install-deps ## Install all dependencies
	pnpm install
	$(MAKE) -C backend install
	$(MAKE) -C extension install

lint:
	$(MAKE) -C backend lint
	# $(MAKE) -C extension lint

test:
	$(MAKE) -C backend test
	$(MAKE) -C extension test

deploy-prod:
	$(MAKE) -C backend deploy-prod

build:
	$(MAKE) -C extension build
	$(MAKE) -C backend build
