ifdef STAGE
	ifneq ("$(STAGE)", "local")
		include envs/$(STAGE).env
	endif
endif

build:
	cd libs/take-home-core && npm run build
	cd apps/get-stocks && npm run build

install-deps:
	@for dir in "./apps/api" "./apps/get-stocks" "./apps/send-report"; do \
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

run-local-get-stocks: build-lambdas
	sam build
	sam local invoke GetStocksFunction \
		--env-vars envs/local.json

start-api:
	cd apps/api/ && npm run start:dev