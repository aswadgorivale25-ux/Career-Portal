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
| **EC2 setup (Node.js/Nginx install via MobaXterm)** | ![EC2 setup](screenshots/01-ec2-setup.png) |
| **Career Portal application form (live)** | ![Career Portal form](screenshots/02-career-portal-form.png) |
| **DynamoDB — CareerApplications table items** | ![DynamoDB items](screenshots/03-dynamodb-items.png) |
| **DynamoDB — item detail view** | ![DynamoDB item detail](screenshots/04-dynamodb-item-detail.png) |

## Notes

- Credentials are never stored in code — the app relies on the EC2 instance's IAM role.
- For production, put Nginx or a load balancer in front instead of exposing port 3000 directly.
