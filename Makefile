DOC_COMMAND=coddoc -f multi-html -d ./lib --dir ./docs
MD_COMMAND=coddoc -f markdown -d ./lib > README.md

test:
	export NODE_PATH=$NODE_PATH:lib && ./node_modules/it/bin/it -r dotmatrix

docs: docclean
	$(DOC_COMMAND) && $(MD_COMMAND)

docclean :
	rm -rf docs/*

test-coverage:
	rm -rf ./lib-cov && node-jscoverage ./lib ./lib-cov && export NODE_PATH=lib-cov:$(NODE_PATH) && export NODE_ENV=test && ./node_modules/it/bin/it -r dotmatrix --cov-html ./docs-md/coverage.html

install: install-jscov

install-jscov: $(JSCOV)
	install $(JSCOV) $(PREFIX)/bin

$(JSCOV):
	cd support/jscoverage && ./configure && make && mv jscoverage node-jscoverage


benchmarks:
	for file in $(BENCHMARKS) ; do \
	    echo $$file && node $$file ; \
	done

.PHONY: test benchmarks



