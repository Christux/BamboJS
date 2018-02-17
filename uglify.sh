#!/bin/sh
uglifyjs bambo.js -o bambo.min.js -c -m -b max_line_len=100,beautify=false --comments '/^!/'
