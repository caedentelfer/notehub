.PHONY: all setup install-backend install-frontend start-backend start-frontend

# The main target that does everything
all: setup install-backend install-frontend start-backend start-frontend

# Make the start script executable
setup:
	chmod +x start.sh

# Install backend dependencies
install-backend:
	cd backend && npm install

# Install frontend dependencies
install-frontend:
	cd frontend && npm install

# Start the backend server
start-backend:
	cd backend && npm start &

# Start the frontend development server
start-frontend:
	cd frontend && npm run dev

# Path to the frontend build script
FRONTEND_BUILD_SCRIPT = ./build-frontend.sh

# Rule to run the frontend build script
Frontend-Test:
	chmod +x build-frontend.sh
	@$(FRONTEND_BUILD_SCRIPT)