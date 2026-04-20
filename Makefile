# Voidframe dev environment shortcuts.
# Every command runs in Docker — nothing touches the host Node install.

.DEFAULT_GOAL := help

.PHONY: help build-image demo dev check tc test test-watch coverage build sh install clean down logs reset install-hooks e2e e2e-ui

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build-image: ## Build/rebuild the dev image
	docker compose build

demo: ## Run the live demo (http://localhost:5173)
	docker compose up demo

dev: ## Run the library dev server (http://localhost:5174)
	docker compose up dev

check: ## Run tsc --noEmit
	docker compose run --rm typecheck

tc: check ## Alias for `check`

test: ## Run the full test suite
	docker compose run --rm test

test-watch: ## Run tests in watch mode
	docker compose run --rm test-watch

coverage: ## Run tests with coverage report
	docker compose run --rm coverage

build: ## Production build (emit .d.ts + dist)
	docker compose run --rm build

sh: ## Open an interactive shell in the dev container
	docker compose run --rm shell

install: ## Refresh node_modules after editing package.json
	docker compose run --rm install

logs: ## Tail logs of running services
	docker compose logs -f

down: ## Stop and remove running containers
	docker compose down

reset: ## Nuke node_modules volume and rebuild image (fresh slate)
	docker compose down -v
	docker compose build --no-cache

clean: ## Remove build artifacts from the host
	rm -rf dist coverage

install-hooks: ## Activate git pre-push hook (runs tests in Docker before push)
	./scripts/install-hooks.sh

e2e: ## Run Playwright e2e tests (chromium + firefox + webkit)
	docker compose run --rm e2e

e2e-ui: ## Serve e2e harness on localhost:5176 for Playwright UI mode
	docker compose up e2e-serve
