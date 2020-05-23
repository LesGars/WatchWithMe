STAGE:=$(shell id -un)

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install -g serverless
	pnpm install

intall-aws-cli-mac:
	brew install awscli

intall-aws-cli-linux: ## Install AWS CLI on Linux
	curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
	unzip awscliv2.zip
	sudo ./aws/install
	rm -rf ./aws
	rm awscliv2.zip

configure: ## Prompt you to configure you AWS Environement
	aws configure --profile lesgars-watch-with-me

format: ## Run eslint and prettier for formatting
	pnpm run lint:fix
	pnpm run prettier:fix

lint:
	pnpm run lint

test:
	pnpm run test

build: ## Run webpack build process (Useful for testing)
	sls package

deploy: ## Deploy to your personnal stage
	sls deploy --stage=$(STAGE)

f-deploy: ## Deploy to your personnal stage
	sls deploy function -f $(F) --stage=$(STAGE)

deploy-prod: ## Deploy to production
	sls deploy --stage=prod

remove: ## Remove your personnal stage
	sls remove --stage=$(STAGE)

remove-prod: ## Remove production
	sls remove --stage=prod

monitor: ## Monitor your stage
	npx sls-dev-tools -p lesgars-watch-with-me -l . -n watch-with-me-$(STAGE)
