# Career Portal — EC2 + Node.js + DynamoDB

A simple job application portal. The frontend is a static HTML/CSS/JS form served by an Express backend on EC2, which writes submissions to a DynamoDB table.

## Architecture

```
User Browser
    │
    ▼
EC2 (Node.js / Express)
    │
    ▼
AWS SDK v3
    │
    ▼
DynamoDB (CareerApplications table)
```

## Project structure

```
career-portal/
├── server.js          # Express backend + DynamoDB integration
├── package.json
├── .gitignore
└── public/
    └── index.html      # Job application form (HTML/CSS/JS)
```

## Features

- Multi-section job application form (personal info, career info, location, skills)
- Client-side validation + fetch-based submission (no page reload)
- Server-side validation
- Data written to DynamoDB via AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- Unique `applicationId` generated with `crypto.randomUUID()`

## Setup

### 1. Create the DynamoDB table

AWS Console → DynamoDB → Tables → Create table

| Setting | Value |
|---|---|
| Table name | `CareerApplications` |
| Partition key | `applicationId` (String) |

Leave everything else as default.

### 2. Clone and install on EC2

```bash
git clone <your-repo-url>
cd career-portal
npm install
```

### 3. Give EC2 permission to DynamoDB (IAM Role — recommended)

Don't hardcode AWS keys. Instead:

1. IAM → Roles → Create role → Trusted entity: **AWS service** → Use case: **EC2**
2. Attach policy: `AmazonDynamoDBFullAccess` (for learning; scope this down for production)
3. Name it, e.g., `EC2-DynamoDB-Role`, and create it
4. EC2 → Instances → select instance → Actions → Security → Modify IAM role → attach `EC2-DynamoDB-Role`

### 4. Run the app

```bash
node server.js
```

You should see:

```
Career Portal running on port 3000
DynamoDB Table: CareerApplications
AWS Region: ap-south-1
```

### 5. Open the security group port

EC2 → Security Groups → Inbound rules → Add rule:

| Type | Port | Source |
|---|---|---|
| Custom TCP | 3000 | 0.0.0.0/0 (restrict this in production, or put Nginx in front) |

### 6. Visit the app

```
http://YOUR-EC2-PUBLIC-IP:3000
```

## Environment variables (optional)

| Variable | Default |
|---|---|
| `PORT` | `3000` |
| `TABLE_NAME` | `CareerApplications` |
| `AWS_REGION` | `ap-south-1` |

## Verify data in DynamoDB

AWS Console → DynamoDB → Explore items → `CareerApplications`

## Screenshots

| | |
|---|---|
| **EC2 setup (Node.js/Nginx install via MobaXterm)** | ![EC2 setup](screenshots/01-<img width="1366" height="768" alt="setup" src="https://github.com/user-attachments/assets/349ad906-8d1f-42b9-b2a8-60f41fb09fdd" />
) |
| **Career Portal application form (live)** | ![Career Portal form](screenshots/02-<img width="1366" height="768" alt="portal-form" src="https://github.com/user-attachments/assets/e4e16ca8-9816-456f-a2d8-b482162cf7ee" />
) |
| **DynamoDB — CareerApplications table items** | ![DynamoDB items](screenshots/03-<img width="1366" height="768" alt="dynamodb-items" src="https://github.com/user-attachments/assets/ea9a07f5-cafa-49ee-a23a-6eee29f9c3db" />
) |
| **DynamoDB — item detail view** | ![DynamoDB item detail](screenshots/04-<img width="1366" height="768" alt="dynamodb-item-detail" src="https://github.com/user-attachments/assets/85a31980-606d-4d43-8d4c-319c52b348ff" />
) |

## Notes

- Credentials are never stored in code — the app relies on the EC2 instance's IAM role.
- For production, put Nginx or a load balancer in front instead of exposing port 3000 directly.
