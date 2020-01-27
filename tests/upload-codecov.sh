#!/usr/bin/env bash

bash <(curl -s https://codecov.io/bash) -t @.cc_token || echo 'Codecov failed to upload'
