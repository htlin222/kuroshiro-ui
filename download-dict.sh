#!/bin/bash

# Create dict directory if it doesn't exist
mkdir -p public/dict

# List of dictionary files
files=(
    "base.dat.gz"
    "check.dat.gz"
    "tid_pos.dat.gz"
    "tid_map.dat.gz"
    "cc.dat.gz"
    "unk.dat.gz"
    "unk_pos.dat.gz"
    "unk_map.dat.gz"
    "unk_char.dat.gz"
    "unk_compat.dat.gz"
)

# Download each file
for file in "${files[@]}"; do
    echo "Downloading $file..."
    curl -L "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/$file" -o "public/dict/$file"
done

echo "All dictionary files downloaded!"
