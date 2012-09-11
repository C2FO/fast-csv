BENCHMARKS = `find benchmark -name benchmark.js`
DOC_COMMAND=coddoc -f multi-html -d ./lib --dir ./docs

test:
	export NODE_PATH=$NODE_PATH:lib && ./node_modules/it/bin/it -r dotmatrix

docs: docclean
	$(DOC_COMMAND)

docclean :
	rm -rf docs/*

benchmarks:
	for file in $(BENCHMARKS) ; do \
	    echo $$file && node $$file ; \
	done

.PHONY: test benchmarks



