help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: install-deps ## Install all dependencies
	pnpm install -g serverless

intall-aws-cli-mac:
	curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
	sudo installer -pkg AWSCLIV2.pkg -target /

intall-aws-cli-linux:
	curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
	unzip awscliv2.zip
	sudo ./aws/install
	rm -rf ./aws
	rm awscliv2.zip

configure:
	aws configure --profile lesgars-watch-with-me

format:
	pnpm run lint:fix
	pnpm run prettier:fix

build:
	sls package

deploy:
	sls deploy

remove:
	sls remove

monitor:
	npx sls-dev-tools -p lesgars-watch-with-me -l . -n watch-with-me-dev
