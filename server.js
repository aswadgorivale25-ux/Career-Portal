const express = require("express");
const path = require("path");
const crypto = require("crypto");
const {
  DynamoDBClient
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const app = express();
const PORT = process.env.PORT || 3000;
const TABLE_NAME = process.env.TABLE_NAME || "CareerApplications";
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

/*
========================================
AWS DYNAMODB CONNECTION
========================================
*/
const dynamoClient = new DynamoDBClient({
  region: AWS_REGION
});
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

/*
========================================
MIDDLEWARE
========================================
*/
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

/*
========================================
STATIC WEBSITE
========================================
*/
app.use(
  express.static(path.join(__dirname, "public"))
);

/*
========================================
HOME PAGE
========================================
*/
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/*
========================================
REGISTER APPLICATION
========================================
*/
app.post("/register", async (req, res) => {
  try {
    console.log("Received application:", req.body);

    /*
    ------------------------------
    GET FORM DATA
    ------------------------------
    */
    const {
      name,
      email,
      mobile,
      dob,
      position,
      experience,
      qualification,
      salary,
      city,
      address,
      skills,
      linkedin,
      workMode,
      about
    } = req.body;

    /*
    ------------------------------
    VALIDATION
    ------------------------------
    */
    if (!name || !email || !mobile || !position || !qualification || !city) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    /*
    ------------------------------
    CREATE APPLICATION ID
    ------------------------------
    */
    const applicationId = crypto.randomUUID();

    /*
    ------------------------------
    DYNAMODB ITEM
    ------------------------------
    */
    const item = {
      applicationId: applicationId,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      dob: dob || "",
      position: position || "",
      experience: experience || "",
      qualification: qualification || "",
      salary: salary || "",
      city: city || "",
      address: address || "",
      skills: skills || "",
      linkedin: linkedin || "",
      workMode: workMode || "",
      about: about || "",
      status: "New",
      createdAt: new Date().toISOString()
    };

    /*
    ------------------------------
    SAVE TO DYNAMODB
    ------------------------------
    */
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });

    await dynamoDB.send(command);

    /*
    ------------------------------
    SUCCESS RESPONSE
    ------------------------------
    */
    console.log("Application saved:", applicationId);

    res.status(200).json({
      success: true,
      message: "Application submitted successfully!",
      applicationId: applicationId
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to save application. Please try again."
    });
  }
});

/*
========================================
START SERVER
========================================
*/
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Career Portal running on port ${PORT}`);
  console.log(`DynamoDB Table: ${TABLE_NAME}`);
  console.log(`AWS Region: ${AWS_REGION}`);
});
