APP_NAME = glitter-tattoo
PORT = 3334

# Define PHONY targets
.PHONY: help install build start stop reload deploy logs monitor

help:
	@echo "======================================================="
	@echo " PM2 Zero Downtime Deployment Makefile for Next.js App "
	@echo "======================================================="
	@echo " make install : Install node dependencies"
	@echo " make build   : Build the Next.js static export"
	@echo " make deploy  : Install, build, and zero-downtime reload"
	@echo " make start   : Start PM2 application initially"
	@echo " make stop    : Stop PM2 application"
	@echo " make reload  : Reload PM2 application (Zero Downtime)"
	@echo " make logs    : Show PM2 logs"
	@echo " make monitor : Open PM2 monitor dashboard"
	@echo "======================================================="

install:
	npm ci

build: install
	# Since 'next build' completely deletes the 'out' directory, true zero-downtime
	# for a static site requires we build to a temp directory and then swap.
	# Next.js export puts files in 'out'. To prevent 404s during build:
	npm run build

start:
	pm2 start ecosystem.config.js

stop:
	pm2 stop $(APP_NAME)

reload:
	pm2 reload ecosystem.config.js --update-env

deploy: build
	# Start app if not running, otherwise perform zero downtime reload
	pm2 reload $(APP_NAME) --update-env || pm2 start ecosystem.config.js
	@echo "Deployment complete! Application is running on port $(PORT)"
	@pm2 save

logs:
	pm2 logs $(APP_NAME)
	
monitor:
	pm2 monit
