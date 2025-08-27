#!/bin/bash

set -e  # Exit on any error

PROJECT_NAME="scholar_backend"
WASM_TARGET="wasm32-unknown-unknown"

echo "🚀 Starting deployment for Scholar..."

# Build the project
echo "🔨 Building the project..."
cargo build --release --target $WASM_TARGET --package $PROJECT_NAME

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Exiting."
    exit 1
fi

# Check if the WASM file exists
WASM_FILE="target/$WASM_TARGET/release/$PROJECT_NAME.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found at $WASM_FILE"
    echo "Available files in target/$WASM_TARGET/release/:"
    ls -la "target/$WASM_TARGET/release/" || echo "Directory doesn't exist"
    exit 1
fi

echo "✅ Build successful!"

# Create output directory if it doesn't exist
mkdir -p src/$PROJECT_NAME

# Extract candid interface from the WASM file
echo "📋 Extracting Candid interface..."
candid-extractor "$WASM_FILE" > "src/$PROJECT_NAME/$PROJECT_NAME.did"

# Check if candid extraction was successful
if [ $? -ne 0 ]; then
    echo "❌ Candid extraction failed. Exiting."
    exit 1
fi

echo "✅ Candid extraction successful!"

dfx deploy $PROJECT_NAME