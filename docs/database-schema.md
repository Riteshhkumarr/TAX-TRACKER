# Database Schema Documentation

## Overview
TaxTracker AI uses MongoDB with Mongoose ODM. All collections include automatic `createdAt` and `updatedAt` timestamps.

---

## Collections

### 1. `users`

Stores user account information and preferences.

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (unique, required, lowercase)",
  "password": "String (hashed with bcrypt, rounds=12)",
  "avatar": "String (URL, nullable)",
  "role": "String (enum: user|admin, default: user)",
  "taxBracket": "Number (default: 22, represents % bracket)",
  "fiscalYear": "String (default: current year)",
  "currency": "String (default: USD)",
  "isEmailVerified": "Boolean (default: false)",
  "resetPasswordToken": "String (nullable)",
  "resetPasswordExpires": "Date (nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:** `email` (unique)
**Virtuals:** None
**Methods:** `comparePassword(candidatePassword)`
**Pre-save Hook:** Hash password before saving

---

### 2. `incomes`

Stores income transaction records.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, required)",
  "source": "String (required, e.g., 'Monthly Salary')",
  "category": "String (enum: salary|freelance|investment|rental|business|other)",
  "amount": "Number (required, min: 0)",
  "currency": "String (default: USD)",
  "date": "Date (required)",
  "description": "String (optional)",
  "isRecurring": "Boolean (default: false)",
  "recurringFrequency": "String (enum: weekly|monthly|quarterly|yearly, nullable)",
  "taxable": "Boolean (default: true)",
  "attachments": "[String] (array of file URLs)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:** `userId`, `date`, `category`

---

### 3. `expenses`

Stores expense records with AI categorization metadata.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, required)",
  "title": "String (required)",
  "amount": "Number (required, min: 0)",
  "category": "String (required, ML-assigned)",
  "subCategory": "String (optional)",
  "date": "Date (required)",
  "description": "String (optional)",
  "isDeductible": "Boolean (default: false)",
  "deductionPercentage": "Number (default: 0, min: 0, max: 100)",
  "receipt": "String (file URL, nullable)",
  "vendor": "String (optional)",
  "paymentMethod": "String (enum: cash|card|bank|digital|other)",
  "tags": "[String]",
  "isAnomaly": "Boolean (default: false)",
  "aiConfidence": "Number (0-1, ML confidence score)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:** `userId`, `date`, `category`, `isAnomaly`

---

### 4. `taxrecords`

Stores quarterly and annual tax summaries.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, required)",
  "year": "Number (required, e.g., 2024)",
  "quarter": "String (enum: Q1|Q2|Q3|Q4|Annual)",
  "totalIncome": "Number (default: 0)",
  "totalExpenses": "Number (default: 0)",
  "totalDeductions": "Number (default: 0)",
  "taxableIncome": "Number (default: 0)",
  "estimatedTax": "Number (default: 0)",
  "taxPaid": "Number (default: 0)",
  "balance": "Number (default: 0, positive = owed, negative = refund)",
  "status": "String (enum: pending|filed|paid, default: pending)",
  "dueDate": "Date",
  "filedDate": "Date (nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:** `userId`, `year`, compound `(userId, year, quarter)` (unique)

---

### 5. `notifications`

Stores user notifications and reminders.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users, required)",
  "title": "String (required)",
  "message": "String (required)",
  "type": "String (enum: deadline|alert|info|success)",
  "isRead": "Boolean (default: false)",
  "link": "String (optional, route to navigate on click)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:** `userId`, `isRead`

---

## Entity Relationships

```
users (1) ──────< incomes (many)
users (1) ──────< expenses (many)
users (1) ──────< taxrecords (many)
users (1) ──────< notifications (many)
```

---

## Aggregation Patterns

### Monthly Income by Category
```javascript
Income.aggregate([
  { $match: { userId: req.user.id, year: 2024 } },
  { $group: {
    _id: { month: { $month: '$date' }, category: '$category' },
    total: { $sum: '$amount' }
  }},
  { $sort: { '_id.month': 1 } }
])
```

### Expense Category Breakdown
```javascript
Expense.aggregate([
  { $match: { userId: req.user.id } },
  { $group: {
    _id: '$category',
    total: { $sum: '$amount' },
    count: { $sum: 1 }
  }},
  { $sort: { total: -1 } }
])
```
