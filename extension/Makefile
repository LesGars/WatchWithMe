.PHONY: build

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependency and start first build
	pnpm install

test:
	pnpm run test

build:
	pnpm run build

f-watch: ## Start hot reload for firefox
	pnpm run firefox:dev

c-watch: ## Start hot reload for chrome
	pnpm run chrome:dev
