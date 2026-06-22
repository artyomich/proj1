#!/bin/bash
# Script to run the Todo List backend server
cd "$(dirname "$0")"

# Activate backend venv
source .venv/bin/activate

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
</content>
<write_to_file>
<path>frontend/run.sh</path>
<content>#!/bin/bash
# Script to run the Todo List frontend server
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Run the Angular dev server
ng serve --host 0.0.0.0 --port 4200