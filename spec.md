# Illness Detector

## Current State
New project. No existing implementation.

## Requested Changes (Diff)

### Add
- An app that allows users to upload a photo of a person and/or describe their symptoms to detect potential illness indicators
- Google Gemini API integration (user provides their own API key) for AI-powered illness analysis
- Analysis output: overall health concern level, possible conditions, visible symptoms detected, and recommendations (see a doctor, rest, etc.)
- API key setup banner/modal on first load
- Result display with severity indicator (low / moderate / high concern)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: minimal canister (no backend storage needed; all analysis is done via frontend HTTP calls to Gemini)
2. Frontend:
   - API key input and local storage
   - Image upload + optional symptom text input
   - Call Gemini Vision API with the image and/or symptom description
   - Display structured results: concern level badge, possible conditions list, visible observations, recommendations
   - Disclaimer that this is not medical advice
