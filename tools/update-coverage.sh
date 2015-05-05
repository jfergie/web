#!/bin/bash

if [ `command -v istanbul` ]; then

    REVISION=`git log -1 --pretty=%h`
    DATE=`git log -1 --pretty=%cD | cut -c 6-16`

    echo "Running coverage analysis..."
    istanbul cover test/app_test.js
    grep -v 'class="path' coverage/lcov-report/index.html | grep -v "class='meta" > test/index.html

else
    echo "Please install Istanbul first!"
fi
