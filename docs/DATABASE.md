# SchemeForge — Database Schema & Data Architecture

This document describes the relational database structure, entity-relationship models, and data seeding strategy for **SchemeForge**.

---

## Entity-Relationship Diagram

```
┌───────────────────────────┐         ┌───────────────────────────┐
│          Scheme           │         │      EligibilityRule      │
├───────────────────────────┤         ├───────────────────────────┤
│ id (PK, Integer)          │ 1     * │ id (PK, Integer)          │
│ schemeCode (String, Unique)├─────────┤ scheme_id (FK, Integer)   │
│ name (String)             │         │ ruleType (String)         │
│ category (String)         │         │ ruleValue (String)        │
│ type (String)             │         │ operator (String)         │
│ state (String)            │         └───────────────────────────┘
│ minAge (Integer)          │
│ maxAge (Integer)          │         ┌───────────────────────────┐
│ maxIncome (Integer)       │         │       SchemeSource        │
│ subsidyAmount (String)    │ 1     * ├───────────────────────────┤
│ officialLink (String)     │─────────┤ id (PK, Integer)          │
└───────────────────────────┘         │ scheme_id (FK, Integer)   │
                                      │ sourceTitle (String)      │
                                      │ sourceUrl (String)        │
                                      └───────────────────────────┘
```

---

## Database Tables

### 1. `schemes` Table
Primary entity storing verified government scheme attributes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Unique identifier |
| `schemeCode` | String(50) | Unique, Not Null, Indexed | Standard identifier (e.g. `PM-KISAN`) |
| `name` | String(255) | Not Null, Indexed | Full official name of scheme |
| `category` | String(100) | Not Null, Indexed | Domain sector (`Agriculture`, `Education`, etc.) |
| `type` | String(50) | Not Null | `Central` or `State` |
| `state` | String(100) | Not Null | `All India` or specific state name |
| `beneficiaryType` | String(100) | Not Null | Target group (`Farmers`, `Students`, etc.) |
| `department` | String(255) | Not Null | Administering Ministry or Department |
| `shortDescription` | Text | Not Null | Concise 1-2 sentence overview |
| `fullDescription` | Text | Not Null | Complete detailed summary |
| `subsidyAmount` | String(255) | Not Null | Financial assistance amount |
| `minAge` | Integer | Default: 0 | Minimum eligible age |
| `maxAge` | Integer | Default: 100 | Maximum eligible age |
| `maxIncome` | Integer | Default: 10000000 | Maximum annual income cap in INR |
| `gender` | String(20) | Default: `All` | Gender restriction (`Male`, `Female`, `All`) |
| `documentsRequired` | JSON / Text | Not Null | Array of required verification documents |
| `applicationProcedure` | Text | Not Null | Step-by-step application instructions |
| `officialLink` | String(500) | Not Null | Official `.gov.in`/`.nic.in` portal URL |
| `isFeatured` | Boolean | Default: False | Highlight on homepage |
| `isPopular` | Boolean | Default: False | Highlight in discovery |

---

### 2. `eligibility_rules` Table
Deterministic rule definitions associated with individual schemes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Rule ID |
| `scheme_id` | Integer | Foreign Key (`schemes.id`) | Associated scheme |
| `ruleType` | String(50) | Not Null | Rule parameter (`age`, `income`, `state`, `farmerStatus`) |
| `operator` | String(10) | Not Null | Comparison (`>=`, `<=`, `==`, `IN`) |
| `ruleValue` | String(255) | Not Null | Threshold or constraint value |

---

### 3. `scheme_sources` Table
Verified provenance sources for scheme details.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Source ID |
| `scheme_id` | Integer | Foreign Key (`schemes.id`) | Associated scheme |
| `sourceTitle` | String(255) | Not Null | Gazette notification or portal title |
| `sourceUrl` | String(500) | Not Null | Direct URL to government portal/PDF |

---

### 4. `contact_messages` Table
User feedback and contact form submissions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Message ID |
| `name` | String(100) | Not Null | Sender name |
| `email` | String(120) | Not Null | Sender email address |
| `subject` | String(200) | Not Null | Message topic |
| `message` | Text | Not Null | Message body |
| `created_at` | DateTime | Default: UTC Now | Timestamp |

---

## Automated Seeding (`seed.py`)

The SQLite database is pre-populated with **26 verified central & state government schemes** covering:
- Agriculture: `PM-KISAN`, `PM-KUSUM`, `Mukhyamantri Kisan Sahay`
- Education: `NMMSS`, `PM-Vidyalaxmi`, `Abhyudaya`
- Women Welfare: `PMMVY`, `Ladki Bahin`, `Kanya Sumangala`, `Subhadra`, `Gruha Lakshmi`, `Kalaignar Magalir Urimai`
- Housing: `PMAY Urban`, `PMAY Gramin`
- Business & Startup: `PM MUDRA`, `PM SVANidhi`, `SISFS`, `PMEGP`, `Stand Up India`, `PM Vishwakarma`
- Healthcare & Social Security: `Ayushman Bharat (PM-JAY)`, `PMJJBY`, `PMSBY`, `Atal Pension Yojana`, `IGNOAPS`, `MGNREGA`
