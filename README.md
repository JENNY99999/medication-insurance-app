# Medication Insurance Chatbot Mobile App

This project provides an API to calculate medication insurance coverage and store cost query records. It leverages AWS Lambda for serverless deployment and integrates GPT-powered chatbot functionality to enhance the user experience.

## Features

- **Medication Insurance Coverage Calculation**:
  - Input medication name or medication ID.
  - Return out-of-pocket costs for the selected medication and insurance plan.

- **Store Query Records in Database**:
  - All user queries are stored in a PostgreSQL database for tracking and analysis.

- **Chatbot Integration**:
  - A chatbot powered by GPT API to provide personalized responses and assist users with their medication insurance queries.

- **AWS Lambda Deployment**:
  - The entire API is deployed using AWS Lambda, ensuring scalability and eliminating the need for managing servers.

## Tech Stack

### Backend

- **FastAPI/Python**: A lightweight Python API framework used for building the backend. It is fast, efficient, and supports asynchronous operations for optimal performance.

### Database

- **PostgreSQL**: Used to store user query records for tracking and analysis. Neon.tech's free version is utilized for this project.

### Cloud Services

- **AWS Lambda**: The API is deployed as serverless functions on AWS Lambda, which automatically scales based on traffic, providing a cost-effective, serverless architecture.

### Chatbot Integration

- **GPT API**: A chatbot powered by the GPT API that interacts with users and helps them with medication insurance coverage queries.

### Frontend

- **React Native**: The mobile app frontend is built using React Native, enabling cross-platform mobile development (iOS and Android) with a single codebase.

