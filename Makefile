DATE:=$(shell date --iso-8601=seconds)

react/build/index.html:
	(cd react ; yarn build)

zip: react/build/index.html
	zip -r zippedBuilds/build-$(DATE).zip algos/ react/build/ main.js manifest.json scripts/ test/

deploy: react/build/index.html
	mkdir -p deploy
	cp -av algos react/build main.js manifest.json scripts deploy

install: deploy
	$(FOXX_CLI) --server $(FOXX_SERVER) remove "/pregelator" 
	$(FOXX_CLI) --server $(FOXX_SERVER) install "/pregelator" deploy/
	
clean:
	rm -rf deploy/
