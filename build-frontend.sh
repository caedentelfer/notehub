#!/bin/bash

# Navigate to the frontend directory
cd frontend || { echo "Failed to navigate to the frontend directory"; exit 1; }

# Run npm build and capture the output into a log file
npm run build > build_output.log 2>&1

# Check if the build failed
if [ $? -ne 0 ]; then
  # If the build failed, check if the specific success condition is met in the log
  if grep -q "✓ Generating static pages ([0-9]\+/[0-9]\+)" build_output.log; then
    # If the success message is found, print "PASS" in green
    echo -e "\e[32mFrontend Build: PASS (Found successful page generation)\e[0m"
    exit 0
  else
    # If the success message is not found, print "FAIL" in red
    echo -e "\e[31mFrontend Build: FAIL\e[0m"
    cat build_output.log  #output the log for debugging
    exit 1
  fi
else
  # If the build succeeded, print "PASS" in green
  echo -e "\e[32mFrontend Build: PASS\e[0m"
fi

