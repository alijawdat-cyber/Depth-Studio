#!/bin/bash
# Fix Firebase App Hosting Service Account Permissions
# Run this script to enable required permissions for Cloud Build

PROJECT_ID="depth-studio"
PROJECT_NUMBER="584154257700"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "🔧 Fixing Firebase App Hosting Permissions..."

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable appengine.googleapis.com --project=$PROJECT_ID
gcloud services enable firebase.googleapis.com --project=$PROJECT_ID
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Grant required roles to Cloud Build Service Account
echo "🔑 Granting roles to Cloud Build Service Account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/appengine.appAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/storage.admin"

echo "✅ Permissions fixed! Now retry App Hosting deployment." 