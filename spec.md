# FoodHygiene Detector

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Image upload interface for any food item (fruits, vegetables, drinks, dishes, packaged food)
- Hygiene analysis using an external AI vision API via HTTP outcalls
- Hygiene score display (0-100) with color-coded rating (Poor / Fair / Good / Excellent)
- Detailed breakdown: contamination risk, freshness level, cleanliness indicators, safety warnings
- History of past scans stored per session
- Category tagging (fruit, vegetable, drink, cooked dish, packaged food, other)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Store scan history: image reference, category, hygiene score, analysis result, timestamp
   - HTTP outcall to Google Gemini Vision API to analyze uploaded image for hygiene indicators
   - CRUD for scan records: create, list, delete
   - Summarize overall hygiene verdict from AI response

2. Frontend:
   - Landing/home page with upload zone and category selector
   - Image preview before submission
   - Loading state during analysis
   - Results card: hygiene score meter, color badge, AI findings breakdown
   - Scan history list with thumbnails and scores
   - Responsive layout
