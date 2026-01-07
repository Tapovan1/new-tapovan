# Face Verification System - Documentation

## Overview
This is an **automated face verification system** with liveness detection. It provides secure authentication using facial recognition with anti-spoofing measures in a single, streamlined flow.

### Key Features
- ✅ **One-Click Verification**: Single button starts the entire process
- ✅ **Live Camera Access**: Real-time video preview
- ✅ **Automatic Liveness Detection**: Auto-captures frames during challenge
- ✅ **Automatic Face Verification**: Seamlessly proceeds after liveness passes
- ✅ **No Manual Steps**: Everything happens automatically
- ✅ **Visual Progress Tracking**: See each step in real-time
- ✅ **Optional Enrollment**: Register new faces when needed

## How It Works

### Automated Verification Flow
1. **Click "Start Verification"** - Camera opens automatically
2. **Challenge Appears** - System shows what action to perform (blink, turn head, etc.)
3. **Auto-Capture** - System captures 5 frames while you perform the action
4. **Auto-Verify Liveness** - Frames are automatically sent for verification
5. **Auto-Verify Face** - If liveness passes, face is automatically verified
6. **See Result** - Get your teacher ID or "no match" message

**Total Time**: ~5-10 seconds from start to finish!

### Enrollment (First Time Only)
- Click "Enroll New Face" button in header
- Enter your teacher ID
- Upload a clear face photo
- Done! Now you can use automated verification

## Features

### 1. **Automated Verification** 
- Single continuous flow
- Live camera preview
- Real-time progress indicators
- Auto-capture during liveness challenge
- Automatic progression through all steps
- Instant results

### 2. **Liveness Detection**
- Challenge-based verification
- Multiple challenge types:
  - BLINK - Blink your eyes
  - TURN_LEFT - Turn head left
  - TURN_RIGHT - Turn head right
  - LOOK_UP - Look upward
  - SMILE - Smile naturally
- Auto-captures 5 frames at 600ms intervals
- 10-second challenge expiration
- Confidence scoring


## API Endpoints

### Base URL
```
http://localhost:8000
```

### 1. Enroll Face
**Endpoint:** `POST /api/face/enroll`  
**Method:** `multipart/form-data`

**Required Fields:**
- `teacher_id`: string (unique identifier)
- `image`: file (JPEG/PNG face image)

**Response:**
```json
{
  "success": true,
  "message": "Face enrolled successfully",
  "teacher_id": "TEACH001"
}
```

---

### 2. Get Liveness Challenge
**Endpoint:** `GET /api/liveness/challenge`  
**Method:** `GET`

**Response:**
```json
{
  "challenge_id": "abc123xyz",
  "challenge": "BLINK",
  "expires_at": "2025-12-31T14:15:25Z",
  "instructions": "Please blink your eyes naturally"
}
```

---

### 3. Verify Liveness
**Endpoint:** `POST /api/liveness/verify`  
**Method:** `multipart/form-data`

**Required Fields:**
- `challenge_id`: string (from challenge endpoint)
- **AND one of:**
  - `frames`: multiple files (3-5 images)
  - `video`: file (short video)

**Response:**
```json
{
  "success": true,
  "liveness_passed": true,
  "message": "Liveness verified successfully",
  "challenge_id": "abc123xyz",
  "confidence": 0.9234
}
```

---

### 4. Verify Face (Login)
**Endpoint:** `POST /api/face/verify`  
**Method:** `multipart/form-data`

**Required Fields:**
- `liveness_challenge_id`: string (from successful liveness verification)
- `image`: file (face image)

**Response (Match Found):**
```json
{
  "success": true,
  "match": true,
  "teacher_id": "TEACH001",
  "score": 0.9567,
  "message": "Face verified successfully"
}
```

**Response (No Match):**
```json
{
  "success": true,
  "match": false,
  "teacher_id": null,
  "score": null,
  "message": "No matching face found"
}
```

---

### 5. Unenroll Face
**Endpoint:** `DELETE /api/face/unenroll/{teacher_id}`  
**Method:** `DELETE`

**Response:**
```json
{
  "success": true,
  "message": "Face embedding deleted successfully",
  "teacher_id": "TEACH001"
}
```

---

### 6. Check Challenge Status (Optional)
**Endpoint:** `GET /api/liveness/challenge/{challenge_id}/status`  
**Method:** `GET`

**Response:**
```json
{
  "exists": true,
  "verified": true,
  "challenge_type": "BLINK",
  "created_at": "2025-12-31T14:15:15Z",
  "expires_at": "2025-12-31T14:15:25Z"
}
```

## Complete Workflow

### First-Time Setup (Enrollment)
1. Navigate to `/face-verify`
2. Click "Enroll New Face" button in header
3. Enter your unique teacher ID
4. Upload a clear face photo (JPEG/PNG)
5. Click "Enroll Face"
6. Wait for success confirmation

### Daily Login (Automated Verification)
1. Navigate to `/face-verify`
2. Click "Start Verification" button
3. Allow camera access when prompted
4. Wait for challenge to appear (e.g., "BLINK")
5. Perform the action naturally
6. System automatically:
   - Captures 5 frames
   - Verifies liveness
   - Verifies your face
   - Shows result
7. See your teacher ID on success!

**That's it! No manual steps, no file uploads, no navigation between tabs.**


## Usage Tips

### For Best Results

**Photo Quality:**
- ✓ Use good lighting
- ✓ Face clearly visible
- ✓ Look directly at camera
- ✓ Remove sunglasses/masks
- ✓ Use JPEG or PNG format
- ✗ Avoid blurry images

**Liveness Challenges:**
- Complete within 10 seconds
- Perform actions naturally
- Ensure good lighting
- 3-5 frames minimum for frame upload
- Keep video short (2-5 seconds)

**Security:**
- Each teacher ID is unique
- Liveness prevents photo spoofing
- Challenge IDs expire quickly
- Face embeddings stored securely

## Technical Details

### Components Structure
```
app/(page)/face-verify/
  └── page.tsx                          # Main page (server component)

components/face-verify/
  ├── face-verify-client.tsx            # Main client with header and enrollment dialog
  ├── automated-face-verify.tsx         # Automated verification flow with live camera
  └── face-enrollment.tsx               # Enrollment (shown in dialog)
```

### Key Component Features

**automated-face-verify.tsx**:
- Live camera access using `navigator.mediaDevices.getUserMedia()`
- Auto-capture frames from video stream
- State machine for step progression
- Automatic API calls (no user intervention)
- Real-time progress indicators
- Error handling with retry options

**face-verify-client.tsx**:
- Simple header with enrollment button
- Dialog for optional enrollment
- Renders automated verification flow

**face-enrollment.tsx**:
- One-time registration
- File upload or camera capture
- Teacher ID input


## Error Handling

The system handles various error cases:
- API server not running
- Invalid challenge ID
- Expired challenges
- No matching face found
- Invalid file formats
- Network errors

All errors are displayed with user-friendly toast notifications.

## Security Features

1. **Liveness Detection**: Prevents photo/video spoofing
2. **Challenge Expiration**: 10-second time limit
3. **Unique Challenge IDs**: One-time use
4. **Confidence Scoring**: Match quality assessment
5. **Secure Embeddings**: Face data stored as embeddings, not images

## Accessing the Page

Navigate to: `/face-verify`

The page is protected and requires user authentication.

## Notes

- Challenges expire in 10 seconds
- Minimum 3 frames, maximum 5 frames for liveness
- Face verification REQUIRES successful liveness check first
- Teacher IDs can be any string format
- Similarity scores range from 0 to 1 (higher is better)
- All endpoints have rate limiting configured

## Support

For issues or questions:
1. Check API server is running on `http://localhost:8000`
2. Verify image formats (JPEG/PNG)
3. Ensure proper lighting for photos
4. Complete liveness challenges within time limit
5. Use valid challenge IDs from successful liveness checks
