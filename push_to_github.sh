#!/bin/bash

# Script Paten Push ke GitHub untuk AI Studio Applet
# Penggunaan: bash push_to_github.sh "https://<GITHUB_TOKEN>@github.com/<USERNAME>/<REPO_NAME>.git"

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
  echo "=================================================================="
  echo "❌ ERROR: Harap berikan URL Repository atau Token GitHub Anda!"
  echo "Contoh penggunaan:"
  echo "  bash push_to_github.sh https://github.com/username/pembuat-soal.git"
  echo "=================================================================="
  exit 1
fi

echo "🚀 Memulai persiapan repositori Git lokal..."

git config --global --add safe.directory /app/applet
git config --global user.name "AI Studio Builder"
git config --global user.email "aistudio@build.internal"

rm -rf .git
git init
git branch -M main

echo "📦 Menambahkan file-file aplikasi..."
git add .
git commit -m "Initial Commit: Pembuat Soal Otomatis (SD, SMP, SMA, SMK)"

echo "🔗 Menghubungkan ke GitHub Remote..."
git remote add origin "$REPO_URL"

echo "⬆️ Mengunggah (Push) ke GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
  echo "=================================================================="
  echo "✅ BERHASIL! Proyek Anda telah berhasil di-push ke GitHub!"
  echo "=================================================================="
else
  echo "=================================================================="
  echo "❌ GAGAL PUSH. Pastikan URL / Token Personal Access Token (PAT) valid."
  echo "=================================================================="
fi
