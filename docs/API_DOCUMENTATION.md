# SchemeForge — REST API Documentation

Complete technical documentation for all HTTP REST API endpoints available in the SchemeForge backend.

**Base URL (Local)**: `http://127.0.0.1:5000/api`  
**Base URL (Production)**: `https://schemeforge-backend.onrender.com/api`

---

## Endpoint Summary Table

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Application health and AI engine status check |
| `GET` | `/schemes` | List all verified schemes with search, state, category & pagination filters |
| `GET` | `/schemes/<id>` | Retrieve full details for a specific scheme by ID or code |
| `GET` | `/schemes/<id>/sources` | Retrieve official government source links for a scheme |
| `GET` | `/categories` | List scheme category counts and active sectors |
| `GET` | `/stats` | Return high-level database metrics and platform statistics |
| `POST` | `/find-schemes` | Find matching schemes based on a structured citizen profile |
| `POST` | `/schemes/<id>/check-eligibility` | Perform deterministic rule eligibility check for a scheme |
| `POST` | `/contact` | Submit a feedback/inquiry message |
| `POST` | `/ai/assistant` | Send conversational prompt to SchemeForge AI Assistant |

---

## Endpoint Details

### 1. GET `/health`
Check application health status and verify whether AI provider (Gemini) is configured.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "SchemeForge REST API",
  "aiProvider": "gemini",
  "aiConfigured": true
}
```

---

### 2. GET `/schemes`
Retrieve a paginated list of schemes with optional filter parameters.

**Query Parameters**:
- `search` *(string, optional)*: Search query string.
- `state` *(string, optional)*: State filter (e.g. `Tamil Nadu`, `All India`).
- `category` *(string, optional)*: Category filter (e.g. `Agriculture`, `Education`, `Housing`).
- `page` *(integer, default: 1)*: Page number.
- `limit` *(integer, default: 12)*: Number of items per page.

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 1,
  "total": 26,
  "page": 1,
  "totalPages": 3,
  "schemes": [
    {
      "id": 1,
      "schemeCode": "PM-KISAN",
      "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      "category": "Agriculture",
      "type": "Central",
      "state": "All India",
      "shortDescription": "Financial assistance of ₹6,000 per year for landholding farmer families across India.",
      "subsidyAmount": "₹6,000 per year"
    }
  ]
}
```

---

### 3. GET `/schemes/<id>`
Fetch comprehensive details for a scheme by ID or scheme code.

**Response `200 OK`**:
```json
{
  "success": true,
  "scheme": {
    "id": 1,
    "schemeCode": "PM-KISAN",
    "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "category": "Agriculture",
    "type": "Central",
    "state": "All India",
    "beneficiaryType": "Farmers",
    "department": "Ministry of Agriculture and Farmers Welfare",
    "shortDescription": "Financial assistance of ₹6,000 per year...",
    "fullDescription": "PM-KISAN is a Central Sector scheme...",
    "subsidyAmount": "₹6,000 per year",
    "documentsRequired": ["Aadhaar Card", "Landholding Ownership Document", "Bank Passbook"],
    "applicationProcedure": "Apply online at pmkisan.gov.in or through CSC center.",
    "officialLink": "https://pmkisan.gov.in"
  }
}
```

---

### 4. POST `/find-schemes`
Evaluate candidate citizen profiles against scheme rules and return matching schemes with match percentages.

**Request Body**:
```json
{
  "state": "Tamil Nadu",
  "age": 24,
  "annualIncome": 200000,
  "gender": "Male",
  "occupation": "Farmer",
  "isFarmer": true
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "matches": [
    {
      "schemeId": 1,
      "schemeName": "PM-KISAN",
      "matchScore": 100,
      "status": "ELIGIBLE",
      "passedRules": [{"ruleName": "farmerStatus", "reason": "Applicant is a registered farmer."}],
      "failedRules": []
    }
  ]
}
```

---

### 5. POST `/ai/assistant`
Main conversational AI assistant endpoint. Accepts citizen query and optional profile/session attributes.

**Request Body**:
```json
{
  "message": "I am an undergraduate from Tamil Nadu earning 2 lakh per year. What scholarships can I get?",
  "sessionId": "user_session_123"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "intent": "SCHEME_DISCOVERY",
  "aiStatus": "GEMINI_SUCCESS",
  "answer": "Based on verified records in SchemeForge, here are the top scholarships and higher education schemes for students in Tamil Nadu...",
  "schemes": [
    {
      "name": "PM-Vidyalaxmi Education Loan & Scholarship",
      "subsidyAmount": "Interest subvention + Collateral-free loan up to ₹10 Lakhs",
      "officialLink": "https://www.vidyalaxmi.co.in"
    }
  ],
  "extractedProfile": {
    "state": "Tamil Nadu",
    "annualIncome": 200000,
    "isStudent": true,
    "occupation": "student"
  }
}
```
