#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run npm install in a directory
run_npm_install() {
    echo -e "${GREEN}Running npm install in $1...${NC}"
    cd $1
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to run npm install in $1${NC}"
        exit 1
    fi
    cd ..
}

# Run npm install in backend and frontend
run_npm_install "backend"
run_npm_install "frontend"

# Start the backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Check if backend server started successfully
sleep 5
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Failed to start backend server${NC}"
    exit 1
fi

# Start the frontend development server
echo -e "${GREEN}Starting frontend development server...${NC}"
cd frontend
npm run dev

# Kill the backend server when the script exits
trap "kill $BACKEND_PID" EXIT