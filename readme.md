# BFHL API - Chitkara University Qualifier 1

A robust REST API with comprehensive input validation, error handling, and security guardrails.

##  Features

 **Strict API Response Structure** - Consistent JSON responses  
 **Correct HTTP Status Codes** - 200, 400, 404, 500, 502, 503, 504  
 **Robust Input Validation** - Type checking, range validation, boundary conditions  
 **Graceful Error Handling** - No crashes, descriptive error messages  
 **Security Guardrails** - Request size limits, input sanitization, safe integer checks  
 **Production Ready** - Global error handlers, timeout protection, overflow prevention  

##  API Endpoints

### 1. GET /health
Health check endpoint.

**Response:**
```json
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in"
}
```

### 2. POST /bfhl
Main endpoint supporting 5 operations: `fibonacci`, `prime`, `lcm`, `hcf`, `AI`

**Important:** Each request must contain **exactly one** key.

#### Fibonacci Sequence
```json
// Request
{ "fibonacci": 7 }

// Response
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": [0, 1, 1, 2, 3, 5, 8]
}
```

#### Prime Filter
```json
// Request
{ "prime": [2, 4, 7, 9, 11] }

// Response
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": [2, 7, 11]
}
```

#### LCM (Least Common Multiple)
```json
// Request
{ "lcm": [12, 18, 24] }

// Response
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": 72
}
```

#### HCF (Highest Common Factor)
```json
// Request
{ "hcf": [24, 36, 60] }

// Response
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": 12
}
```

#### AI Question
```json
// Request
{ "AI": "What is the capital city of Maharashtra?" }

// Response
{
  "is_success": true,
  "official_email": "your.email@chitkara.edu.in",
  "data": "Mumbai"
}
```

## Input Validation & Security

### Global Limits
- Request body size: **10KB max**
- Array length: **1000 elements max**
- Array values: **±1,000,000 max**
- Fibonacci input: **1000 max**
- AI question length: **1000 characters max**

### Validation Rules

**Fibonacci:**
-  Must be non-negative integer
-  Must be ≤ 1000
-  Prevents overflow with safe integer check

**Prime:**
-  Must be array of integers
-  Can be empty (returns [])
-  Each element validated as safe integer

**LCM:**
-  Must be non-empty array
-  Each element validated as integer
-  Overflow protection during calculation

**HCF:**
-  Must be non-empty array
-  Each element validated as integer
-  Works with negative numbers and zero

**AI:**
-  Must be non-empty string
-  Length ≤ 1000 characters
-  10-second timeout protection
-  Returns single-word response

### Error Responses

All errors return `is_success: false` with descriptive messages:

```json
{
  "is_success": false,
  "error": "Descriptive error message"
}
```

##  Setup Instructions

### Prerequisites
- Node.js 14+ installed
- Google Gemini API key

### 1. Clone Repository
```bash
git clone <https://github.com/darklegend91/Qualifier-BFHL.git>
cd Qualifier-BFHL
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
OFFICIAL_EMAIL=yourname@chitkara.edu.in
GEMINI_API_KEY=your_gemini_api_key
```

#### Get Google Gemini API Key:
1. Visit https://aistudio.google.com
2. Sign in with Google account
3. Click **Get API Key**
4. Create API key in project
5. Copy and paste into `.env`

### 4. Run Locally
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs at: `https://qualifier-bfhl.vercel.app/`

### 5. Test the API

**Using curl:**
```bash
# Health check
curl https://qualifier-bfhl.vercel.app/health

# Fibonacci
curl -X POST https://qualifier-bfhl.vercel.app/bfhl \
  -H "Content-Type: application/json" \
  -d '{"fibonacci": 7}'

# Prime
curl -X POST https://qualifier-bfhl.vercel.app/bfhl \
  -H "Content-Type: application/json" \
  -d '{"prime": [2,4,7,9,11]}'
```

**Using Postman Client:**
- See detailed test scenarios in `VALIDATION_DOCUMENTATION.md`

## Deployment

### Option 1: Vercel

1. Pushed code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click **New Project** → Import repository
4. Added Environment Variables:
   - `OFFICIAL_EMAIL`
   - `GEMINI_API_KEY`
5. Deploy
6. Copy public URL


##  Project Structure

```
bfhl-api/
├── server.js                      # Main application
├── package.json                   # Dependencies
├── .env                          # Your config (gitignored)
├── VALIDATION_DOCUMENTATION.md   # Detailed validation docs
└── README.md                     # This file
```

## Testing

### All Test Cases Covered

### Ran Manual Tests

```bash
# import into Postman Client
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request - Invalid input |
| 404  | Route not found |
| 500  | Internal server error |
| 502  | AI service error |
| 503  | AI service unavailable |
| 504  | AI service timeout |

## Security Features

1. **Request Size Limiting** - 10KB max prevents DoS
2. **Input Validation** - All inputs sanitized
3. **Safe Integer Checks** - Prevents overflow attacks
4. **Array Length Limits** - Prevents memory exhaustion
5. **API Timeouts** - 10-second timeout for AI calls
6. **CORS Enabled** - Secure cross-origin requests
7. **Error Sanitization** - No sensitive data in errors

##  Documentation Files

- **README.md** - Setup and deployment guide
- **VALIDATION_DOCUMENTATION.md** - Complete validation rules

##  Submission Checklist

- [ ] Repository is public on GitHub
- [ ] `.env.example` included (no secrets)
- [ ] All dependencies in `package.json`
- [ ] README with clear instructions
- [ ] API deployed and publicly accessible
- [ ] Both endpoints working (`/health` and `/bfhl`)
- [ ] All validations implemented
- [ ] Error handling tested
- [ ] Environment variables configured
- [ ] Test with all 5 operations

##  Support

For issues or questions, refer to:
- `VALIDATION_DOCUMENTATION.md` - Detailed validation rules

##  Author

**Aditya Pathania (2310990352)**  
Chitkara University - Class of 2027  
Email: aditya0352.be23@chitkara.edu.in

---

## Quick Start Commands

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your details

# Run
npm start

# Test
curl https://qualifier-bfhl.vercel.app/health
```