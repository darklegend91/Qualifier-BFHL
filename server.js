const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Variables
const EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Constraints for validation
const MAX_FIBONACCI_INPUT = 1000;
const MAX_ARRAY_LENGTH = 1000;
const MAX_ARRAY_VALUE = 1000000;
const MAX_AI_QUESTION_LENGTH = 1000;

/* ---------- Utility Functions ---------- */

/**
 * Check if a number is prime
 */
const isPrime = (n) => {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

/**
 * Calculate GCD using Euclidean algorithm
 */
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
};

/**
 * Calculate LCM
 */
const lcm = (a, b) => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

/**
 * Validate if value is a safe integer
 */
const isSafeInteger = (value) => {
  return Number.isInteger(value) && 
         Number.isSafeInteger(value) && 
         isFinite(value);
};

/**
 * Validate array of integers
 */
const validateIntegerArray = (arr, minLength = 1) => {
  if (!Array.isArray(arr)) {
    return { valid: false, error: "Input must be an array" };
  }
  
  if (arr.length === 0 && minLength > 0) {
    return { valid: false, error: "Array cannot be empty" };
  }
  
  if (arr.length > MAX_ARRAY_LENGTH) {
    return { valid: false, error: `Array length exceeds maximum of ${MAX_ARRAY_LENGTH}` };
  }
  
  for (let i = 0; i < arr.length; i++) {
    if (!isSafeInteger(arr[i])) {
      return { valid: false, error: `Invalid integer at index ${i}` };
    }
    
    if (Math.abs(arr[i]) > MAX_ARRAY_VALUE) {
      return { valid: false, error: `Value at index ${i} exceeds maximum allowed value` };
    }
  }
  
  return { valid: true };
};

/* ---------- GET /health ---------- */
app.get("/health", (req, res) => {
  // Validate EMAIL is configured
  if (!EMAIL) {
    return res.status(500).json({
      is_success: false,
      error: "Server configuration error"
    });
  }
  
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

/* ---------- POST /bfhl ---------- */
app.post("/bfhl", async (req, res) => {
  try {
    // Validate EMAIL configuration
    if (!EMAIL) {
      return res.status(500).json({
        is_success: false,
        error: "Server configuration error"
      });
    }
    
    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        is_success: false,
        error: "Invalid request body"
      });
    }
    
    // Validate exactly one key is present
    const keys = Object.keys(req.body);
    if (keys.length === 0) {
      return res.status(400).json({
        is_success: false,
        error: "Request body cannot be empty"
      });
    }
    
    if (keys.length > 1) {
      return res.status(400).json({
        is_success: false,
        error: "Request must contain exactly one key"
      });
    }
    
    const key = keys[0];
    const allowedKeys = ["fibonacci", "prime", "lcm", "hcf", "AI"];
    
    // Validate key is one of the allowed keys
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        is_success: false,
        error: `Invalid key. Allowed keys: ${allowedKeys.join(", ")}`
      });
    }
    
    let result;
    
    // Handle fibonacci
    if (key === "fibonacci") {
      const n = req.body.fibonacci;
      
      // Validate input is an integer
      if (!isSafeInteger(n)) {
        return res.status(400).json({
          is_success: false,
          error: "Fibonacci input must be a valid integer"
        });
      }
      
      // Validate non-negative
      if (n < 0) {
        return res.status(400).json({
          is_success: false,
          error: "Fibonacci input must be non-negative"
        });
      }
      
      // Validate reasonable upper bound
      if (n > MAX_FIBONACCI_INPUT) {
        return res.status(400).json({
          is_success: false,
          error: `Fibonacci input exceeds maximum of ${MAX_FIBONACCI_INPUT}`
        });
      }
      
      // Generate fibonacci series
      result = [];
      if (n === 0) {
        // Edge case: n = 0 returns empty array
        result = [];
      } else {
        let a = 0, b = 1;
        for (let i = 0; i < n; i++) {
          result.push(a);
          [a, b] = [b, a + b];
        }
      }
    }
    
    // Handle prime
    else if (key === "prime") {
      const arr = req.body.prime;
      
      // Validate array
      const validation = validateIntegerArray(arr, 0);
      if (!validation.valid) {
        return res.status(400).json({
          is_success: false,
          error: validation.error
        });
      }
      
      // Filter prime numbers
      result = arr.filter(num => isPrime(num));
    }
    
    // Handle lcm
    else if (key === "lcm") {
      const arr = req.body.lcm;
      
      // Validate array
      const validation = validateIntegerArray(arr, 1);
      if (!validation.valid) {
        return res.status(400).json({
          is_success: false,
          error: validation.error
        });
      }
      
      // Check for zero values (LCM with zero is zero)
      if (arr.some(val => val === 0)) {
        result = 0;
      } else {
        // Calculate LCM
        try {
          result = arr.reduce((a, b) => {
            const lcmValue = lcm(a, b);
            if (!isFinite(lcmValue) || !Number.isSafeInteger(lcmValue)) {
              throw new Error("LCM calculation resulted in unsafe value");
            }
            return lcmValue;
          });
        } catch (error) {
          return res.status(400).json({
            is_success: false,
            error: "LCM calculation overflow - values too large"
          });
        }
      }
    }
    
    // Handle hcf
    else if (key === "hcf") {
      const arr = req.body.hcf;
      
      // Validate array
      const validation = validateIntegerArray(arr, 1);
      if (!validation.valid) {
        return res.status(400).json({
          is_success: false,
          error: validation.error
        });
      }
      
      // Calculate HCF/GCD
      result = arr.reduce((a, b) => gcd(a, b));
    }
    
    // Handle AI
    else if (key === "AI") {
      const question = req.body.AI;
      
      // Validate input is string
      if (typeof question !== "string") {
        return res.status(400).json({
          is_success: false,
          error: "AI input must be a string"
        });
      }
      
      // Validate non-empty string
      if (question.trim().length === 0) {
        return res.status(400).json({
          is_success: false,
          error: "AI question cannot be empty"
        });
      }
      
      // Validate reasonable length
      if (question.length > MAX_AI_QUESTION_LENGTH) {
        return res.status(400).json({
          is_success: false,
          error: `AI question exceeds maximum length of ${MAX_AI_QUESTION_LENGTH}`
        });
      }
      
      // Validate API key is configured
      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          is_success: false,
          error: "AI service not configured"
        });
      }
      
      // Call Gemini API
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [{
                text: `Answer the following question with a single word only: ${question}`
              }]
            }]
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Extract and validate response
        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
          return res.status(500).json({
            is_success: false,
            error: "AI service returned invalid response"
          });
        }
        
        // Extract first word as single-word response
        result = aiResponse.trim().split(/\s+/)[0].replace(/[.,!?;:]/g, '');
        
        // Validate we got a word
        if (!result || result.length === 0) {
          result = "Unknown";
        }
        
      } catch (error) {
        // Handle API errors
        if (error.response) {
          // API returned error response
          return res.status(502).json({
            is_success: false,
            error: "AI service error"
          });
        } else if (error.code === 'ECONNABORTED') {
          // Timeout
          return res.status(504).json({
            is_success: false,
            error: "AI service timeout"
          });
        } else {
          // Network or other errors
          return res.status(503).json({
            is_success: false,
            error: "AI service unavailable"
          });
        }
      }
    }
    
    // Return successful response
    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });
    
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error:", error);
    res.status(500).json({
      is_success: false,
      error: "Internal server error"
    });
  }
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    is_success: false,
    error: "Route not found"
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  
  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      is_success: false,
      error: "Invalid JSON"
    });
  }
  
  res.status(500).json({
    is_success: false,
    error: "Internal server error"
  });
});

/* ---------- Server ---------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;