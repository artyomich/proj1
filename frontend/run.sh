#!/bin/bash
# Script to run the Todo List frontend server
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Run the Angular dev server
ng serve --host 0.0.0.0 --port 4200