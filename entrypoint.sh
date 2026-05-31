#!/bin/sh

echo "Running migrations..."
npm run migrate

echo "Running seed (safe)..."
npm run seed

echo "Starting server..."
npm run start