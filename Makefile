DATE:=$(shell date --iso-8601=seconds)

react/build/index.html:
	(cd react ; yarn build)

zip: react/build/
	zip -r zippedBuilds/build-$(DATE).zip algos/ react/build/ main.js manifest.json scripts/ test/
