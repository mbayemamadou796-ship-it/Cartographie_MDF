#!/bin/bash
echo "=== Déploiement Production Cartographie MDF ==="
npm ci
npm run build
docker build -t cartographie-mdf -f infra/docker/Dockerfile .
echo "Déploiement terminé avec succès !"
