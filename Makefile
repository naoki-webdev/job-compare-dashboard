.PHONY: help setup up api frontend install bundle db-prepare migrate seed-if-empty web-shell db-shell down logs ci test-frontend e2e terraform-blueprint-init terraform-blueprint-validate terraform-blueprint-plan

DOCKER_COMPOSE := docker compose
WEB_SERVICE := web
VITE_HOST := 127.0.0.1
VITE_PORT := 5173
FRONTEND_ARGS ?= --host $(VITE_HOST) --port $(VITE_PORT) --strictPort
WEB_SHELL_COMMAND ?= exec bash
DB_SHELL_COMMAND ?= exec psql -U postgres -d job_compare_development
GIT_BASH ?= "C:/Program Files/Git/bin/bash.exe"
TERRAFORM_BLUEPRINT_DIR := infra/terraform/render-blueprint-check
TERRAFORM ?= docker run --rm -v "$(CURDIR):/workspace" -w /workspace hashicorp/terraform:1.6.6

help:
	@echo "Available targets:"
	@echo "  make setup          Build containers, install deps, prepare DB, and seed if empty"
	@echo "  make up             Start db/web, prepare DB, seed if empty, then launch Vite"
	@echo "  make api            Start db/web and prepare the Rails app"
	@echo "  make frontend       Launch the Vite dev server on $(VITE_HOST):$(VITE_PORT)"
	@echo "  make install        Install frontend dependencies"
	@echo "  make bundle         Run bundle install in the web container"
	@echo "  make migrate        Run Rails migrations in the web container"
	@echo "  make web-shell      Open a bash shell in the web container"
	@echo "  make db-shell       Open psql in the db container"
	@echo "  make down           Stop docker compose services"
	@echo "  make logs           Follow docker compose logs"
	@echo "  make ci             Run the project CI command set"
	@echo "  make test-frontend  Run frontend lint and tests"
	@echo "  make e2e            Run Playwright E2E"
	@echo "  make terraform-blueprint-init      Initialize the Render Blueprint Terraform check"
	@echo "  make terraform-blueprint-validate  Validate the Render Blueprint Terraform check"
	@echo "  make terraform-blueprint-plan      Run the Render Blueprint Terraform check"

setup:
	$(DOCKER_COMPOSE) up -d --build db $(WEB_SERVICE)
	$(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bundle install
	npm install
	$(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bin/rails db:prepare
	@$(MAKE) seed-if-empty
	@echo "== Setup complete =="

up:
	@$(MAKE) setup
	@$(MAKE) frontend

api:
	$(DOCKER_COMPOSE) up -d --build db $(WEB_SERVICE)
	$(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bin/rails db:prepare
	@$(MAKE) seed-if-empty

frontend:
	npm run dev -- $(FRONTEND_ARGS)

install:
	npm install

bundle:
	$(DOCKER_COMPOSE) exec $(WEB_SERVICE) bundle install

db-prepare:
	$(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bin/rails db:prepare

migrate:
	$(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bin/rails db:migrate

seed-if-empty:
	@powershell -NoProfile -Command "& { $(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bundle exec rails runner 'exit(Job.exists? ? 0 : 1)'; if ($$LASTEXITCODE -eq 0) { Write-Output '== Seed data already exists. Skipping db:seed =='; } else { Write-Output '== No jobs found. Running db:seed =='; $(DOCKER_COMPOSE) exec -T $(WEB_SERVICE) bin/rails db:seed } }"

web-shell:
	$(DOCKER_COMPOSE) exec $(WEB_SERVICE) bash -lc "$(WEB_SHELL_COMMAND)"

db-shell:
	$(DOCKER_COMPOSE) exec db sh -lc "$(DB_SHELL_COMMAND)"

down:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f db $(WEB_SERVICE)

ci:
	$(GIT_BASH) bin/ci

test-frontend:
	npm run lint
	npm run test:frontend

e2e:
	npm run test:e2e

terraform-blueprint-init:
	$(TERRAFORM) -chdir=$(TERRAFORM_BLUEPRINT_DIR) init

terraform-blueprint-validate:
	$(TERRAFORM) -chdir=$(TERRAFORM_BLUEPRINT_DIR) validate

terraform-blueprint-plan:
	$(TERRAFORM) -chdir=$(TERRAFORM_BLUEPRINT_DIR) plan
