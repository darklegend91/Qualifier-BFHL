# API Validation & Edge Cases Documentation

## Overview
This document details all input validations and edge cases handled in the BFHL API implementation.

## Global Validations

### 1. Request Body Validation
- Request body must exist and be a valid object
-  Request body cannot be empty
-  Request must contain **exactly one key**
-  Key must be one of: `fibonacci`, `prime`, `lcm`, `hcf`, `AI`
-  Invalid JSON returns 400 error with appropriate message

### 2. Server Configuration
-  Email must be configured (checked in both endpoints)
-  Gemini API key must be configured (for AI endpoint)

### 3. Security Guardrails
-  Request size limited to 10KB (prevents DoS)
-  Maximum array length: 1000 elements
-  Maximum array value: ±1,000,000
-  Maximum Fibonacci input: 1000
-  Maximum AI question length: 1000 characters
-  All integers validated as safe integers (prevent overflow)

## Endpoint-Specific Validations

### GET /health

**Validations:**
1. Server email configuration check
2. Returns 500 if email not configured
3. Returns 200 with success response if configured

**Edge Cases:**
- Missing environment variable
- Server misconfiguration

---

### POST /bfhl - fibonacci

**Input Requirements:**
- Must be a single integer
- Must be non-negative (≥ 0)
- Must be ≤ 1000

**Validations:**
1.  Type check - must be integer
2.  Must be a safe integer (Number.isSafeInteger)
3.  Must be finite
4.  Non-negative validation
5.  Upper bound validation (prevents memory issues)

**Edge Cases Handled:**
- `fibonacci: 0` → Returns empty array `[]`
- `fibonacci: 1` → Returns `[0]`
- `fibonacci: 2` → Returns `[0, 1]`
- `fibonacci: -5` → Error: must be non-negative
- `fibonacci: 1001` → Error: exceeds maximum
- `fibonacci: 3.5` → Error: must be integer
- `fibonacci: "7"` → Error: must be integer
- `fibonacci: null` → Error: invalid integer
- `fibonacci: NaN` → Error: invalid integer
- `fibonacci: Infinity` → Error: invalid integer

**Example Valid Requests:**
```json
{"fibonacci": 0}    // Returns []
{"fibonacci": 7}    // Returns [0,1,1,2,3,5,8]
{"fibonacci": 1000} // Returns 1000 fibonacci numbers
```

---

### POST /bfhl - prime

**Input Requirements:**
- Must be an array of integers
- Array can be empty (returns empty array)
- Each element must be a safe integer
- Array length ≤ 1000
- Each value must be ≤ ±1,000,000

**Validations:**
1.  Must be an array
2.  Array length validation
3.  Each element type validation
4.  Each element must be safe integer
5.  Each element value range validation

**Edge Cases Handled:**
- `prime: []` → Returns `[]`
- `prime: [2]` → Returns `[2]`
- `prime: [1]` → Returns `[]` (1 is not prime)
- `prime: [2, 2, 2]` → Returns `[2, 2, 2]` (duplicates preserved)
- `prime: [-5, -3, 0, 1, 2]` → Returns `[2]` (negatives not prime)
- `prime: [2, 3.5, 5]` → Error: invalid integer at index 1
- `prime: "123"` → Error: must be array
- `prime: [1000001]` → Error: value exceeds maximum
- Large primes (e.g., 997) → Correctly identified

**Example Valid Requests:**
```json
{"prime": [2,4,7,9,11]}      // Returns [2,7,11]
{"prime": []}                 // Returns []
{"prime": [2,3,5,7,11,13]}   // Returns [2,3,5,7,11,13]
```

---

### POST /bfhl - lcm

**Input Requirements:**
- Must be an array of integers
- Array cannot be empty
- Each element must be a safe integer
- Array length ≤ 1000
- Each value must be ≤ ±1,000,000

**Validations:**
1.  Must be an array
2.  Cannot be empty array
3.  Array length validation
4.  Each element type validation
5.  Each element must be safe integer
6.  LCM overflow protection

**Edge Cases Handled:**
- `lcm: [12]` → Returns `12` (single element)
- `lcm: [0, 5]` → Returns `0` (LCM with 0 is 0)
- `lcm: [1, 1, 1]` → Returns `1`
- `lcm: [-12, 18]` → Returns `36` (works with negatives)
- `lcm: []` → Error: array cannot be empty
- `lcm: [999999, 999998]` → Overflow check, returns error if unsafe
- Large LCM calculations → Validates result is safe integer

**Example Valid Requests:**
```json
{"lcm": [12,18,24]}  // Returns 72
{"lcm": [5,7,3]}     // Returns 105
{"lcm": [1]}         // Returns 1
```

---

### POST /bfhl - hcf

**Input Requirements:**
- Must be an array of integers
- Array cannot be empty
- Each element must be a safe integer
- Array length ≤ 1000
- Each value must be ≤ ±1,000,000

**Validations:**
1.  Must be an array
2.  Cannot be empty array
3.  Array length validation
4.  Each element type validation
5.  Each element must be safe integer

**Edge Cases Handled:**
- `hcf: [24]` → Returns `24` (single element)
- `hcf: [0, 5]` → Returns `5` (GCD(0,n) = n)
- `hcf: [0, 0]` → Returns `0`
- `hcf: [-24, 36]` → Returns `12` (works with negatives)
- `hcf: [7, 13]` → Returns `1` (coprime numbers)
- `hcf: []` → Error: array cannot be empty

**Example Valid Requests:**
```json
{"hcf": [24,36,60]}  // Returns 12
{"hcf": [15,25,35]}  // Returns 5
{"hcf": [17,19]}     // Returns 1 (coprime)
```

---

### POST /bfhl - AI

**Input Requirements:**
- Must be a string
- Cannot be empty or only whitespace
- Length ≤ 1000 characters

**Validations:**
1.  Must be a string type
2.  Cannot be empty string
3.  Cannot be only whitespace
4.  Length validation
5.  API key configuration check
6.  API timeout (10 seconds)
7.  API response validation

**Edge Cases Handled:**
- `AI: ""` → Error: question cannot be empty
- `AI: "   "` → Error: question cannot be empty
- `AI: 123` → Error: must be string
- `AI: null` → Error: must be string
- Very long question → Error: exceeds maximum length
- API timeout → Returns 504 error
- API unavailable → Returns 503 error
- Invalid API response → Returns 500 error
- API key not configured → Returns 500 error

**Response Processing:**
- Extracts first word from AI response
- Removes punctuation (., !, ?, ;, :)
- Trims whitespace
- Returns "Unknown" if no valid word found

**Example Valid Requests:**
```json
{"AI": "What is the capital of Maharashtra?"}  // Returns "Mumbai"
{"AI": "Define photosynthesis"}                // Returns single-word answer
```

---

## HTTP Status Codes Used

| Code | Usage |
|------|-------|
| 200  | Success |
| 400  | Bad Request (validation errors) |
| 404  | Route not found |
| 500  | Internal server error / configuration error |
| 502  | AI service returned error |
| 503  | AI service unavailable |
| 504  | AI service timeout |

## Error Response Structure

All errors return:
```json
{
  "is_success": false,
  "error": "Descriptive error message"
}
```

## Success Response Structure

All successful responses return:
```json
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": <result>
}
```

## Additional Security Features

1. **CORS enabled** - Allows cross-origin requests
2. **Request size limiting** - 10KB max to prevent DoS
3. **Input sanitization** - All inputs validated before processing
4. **Safe integer checks** - Prevents overflow attacks
5. **Array length limits** - Prevents memory exhaustion
6. **API timeout** - Prevents hanging requests
7. **Error message sanitization** - No sensitive info leaked
8. **Global error handler** - Catches unexpected errors

## Testing Recommendations

### Boundary Conditions to Test:
1. Empty inputs
2. Single element arrays
3. Maximum allowed values
4. Minimum allowed values (0, negatives)
5. Invalid types (string instead of number, etc.)
6. Missing required fields
7. Extra unexpected fields
8. Malformed JSON
9. Very large numbers
10. Special values (null, undefined, NaN, Infinity)

### Security Edge Cases:
1. SQL injection attempts (not applicable but validated)
2. XSS attempts in AI questions
3. Buffer overflow attempts (protected by limits)
4. DoS via large payloads (10KB limit)
5. DoS via large arrays (1000 element limit)

## Environment Variables Required

Create `.env` file:
```env
OFFICIAL_EMAIL=your.email@chitkara.edu.in
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] OFFICIAL_EMAIL set correctly
- [ ] GEMINI_API_KEY obtained and set
- [ ] Test all endpoints with valid inputs
- [ ] Test all error scenarios
- [ ] Verify CORS is working
- [ ] Check response times
- [ ] Verify public accessibility
- [ ] GitHub repo is public
- [ ] README.md included