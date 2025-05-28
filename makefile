ifdef STAGE
	ifneq ("$(STAGE)", "local")
		include envs/$(STAGE).env
	endif
endif

build:
	cd apps/get-stocks && npm run build

install-deps:
	@for dir in "./libs/take-home-core" "./apps/api" "./apps/get-stocks" "./apps/send-report"; do \
		echo "Installing dependencies in $$dir"; \
		cd $$dir && npm install && cd ../..; \
	done

deploy:
	sam build
	sam deploy \
	    --parameter-overrides \
	        Stage=$(STAGE) \
			StocksApiUrl=$(STOCKS_API_URL) \
			StocksApiKeySecret=$(STOCKS_API_KEY_SECRET) \
			StocksPath=$(STOCKS_PATH) 

run-local-get-stocks:
	sam build
	sam local invoke GetStocksFunction \
		--env-vars envs/local.json

start-api:
	cd apps/api/ && npm run start:dev

build-api:
	cd apps/api && npm install && npm run build

build-api-image:
	cp ./envs/$(STAGE).env apps/api/.env
	cd apps/api && docker build --build-arg NPM_TOKEN=$(NPM_TOKEN) -t take-home-api:latest .

publish-libs:
	cd libs/take-home-core && npm build && npm publish