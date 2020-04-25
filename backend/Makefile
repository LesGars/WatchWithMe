help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: install-deps ## Install all dependencies
	pnpm install -g serverless

deploy: 
	sls deploy

log-handler:
	sls logs -t -f handler
