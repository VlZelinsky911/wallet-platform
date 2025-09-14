// MongoDB initialization script for auth service
db = db.getSiblingDB("auth-service");

// Create the auth-service database if it doesn't exist
db.createCollection("users");

print("Auth service database initialized successfully");
