# Software Requirements Specification (SRS)

# **1\. Introduction**

## **1.1 Purpose**

This SRS defines the requirements for an application that enables developers to deploy their applications from GitHub to AWS without needing DevOps or cloud expertise. The system automates the creation of a DevOps pipeline and manages deployment, targeting an MVP to validate core functionality.

## 1.2 Scope

The software will do the following:

* Integrate with GitHub to access user repositories.
* Automate a CI/CD pipeline using GitHub Actions and Terraform.
* Deploy applications to AWS Elastic Container Registry (ECR) using Docker containers.
* Provision infrastructure with Terraform.
* Monitor deployments with Prometheus and ensure security with Snyk.
* Set up a reverse proxy using Nginx and create an SSL certificate.
* Provide a user-friendly interface built with Next.js and a robust backend with FastAPI.

## 1.3 Technologies Used

* **Version Control:** GitHub
* **Backend Framework:** FastAPI
* **Frontend Framework:** Next.js
* **CI/CD Tool:** GitHub Actions
* **Containerization:** Docker
* **Cloud Provider:** AWS
* **Container Registry**: ECR
* **Infrastructure as Code:** Terraform
* **Configuration Management**: Ansible
* **Monitoring:** Prometheus
* **~~Security Scanning:~~** ~~Snyk~~
* **Database:** MongoDB

* * *

# 2\. Overall Description

#### **2.1 User Needs**

* Developers need a simple way to deploy applications from **GitHub** to The **Cloud**.
* Minimal configuration and expertise should be required.
* Users expect visibility into deployment status and basic monitoring.

#### **2.2 Assumptions and Dependencies**

* Users have **active GitHub accounts** and **repositories with valid code**.
* Our software will provide **AWS credentials** for users through **AMI roles**.
* There is minimal configuration, such as **updating the code to deploy it**, creating a **.env** file, and **checking the app for errors**.
* The system relies on **third-party tools** like Terraform, Prometheus, and Snyk, which must be compatible with the application's current versions.

* * *

# 3\. System Features

## **3.1 GitHub Integration**

* **Description**: Connect to GitHub to access and manage repositories.
* **Functional Requirements**:
  * Authenticate users via **GitHub OAuth**.
  * List user repositories and allow the selection of one for deployment (**default: main branch**).
  * Use **GitHub API** to fetch repository folder structure and configuration files (e.g., **`package.json`**).
  * Set up **GitHub webhooks** to trigger pipelines on **code pushes**.
* **Tools**: GitHub API, GitHub OAuth.

## **3.2 Backend API**

* **Description**: Provide a RESTful API to manage user interactions and deployment processes.
* **Functional Requirements**:
  * Expose endpoints for authentication, repository selection, and deployment initiation.
  * Analyze repository metadata to detect language/framework (e.g., **Node.js**, **Python**).
  * Coordinate with CI/CD and cloud services.
* **Tools**: **FastAPI, MongoDB**.

## 3.3 **Pre-configured Pipeline Templates**

**Description**: pre-configured pipelines in a clear, modular directory format.

* **Functional Requirements**:
  * Locate and manage pipeline templates for specific frameworks.
  * Simple to add new frameworks or technologies (e.g., **`/Piplines/Backend/Flask`** **`/Piplines/Frontend/React/`**).
  * This architecture can utilize a pipeline template **across various frameworks**, such as **security scanning** and **application monitoring** (e.g., **`/pipelines/Security/Snyk/`** **or** **`/pipelines/Monitoring/`****P****`rometheus`**).
  * **Each framework** can have its **specific configurations**.

## **3.4 Frontend Interface**

* **Description**: Offer a web-based UI for users to interact with the system.
* **Functional Requirements**:
  * Display **GitHub login** and **repository selection** options.
  * Show **deployment status** and basic monitoring metrics.
  * Provide a form for minimal configuration (e.g., **app name**, **environment** **variables**).
* **Tools**: **Next.js.**

## **3.5 Continuous Integration (CI)**

* **Description**: Automate the build and test stages of the pipeline.
* **Functional Requirements**:
  * Trigger builds on code pushes via **GitHub webhooks**.
  * **Build Docker images** based on **detected project requirements**.
  * Run basic tests (if provided) or skip if none exist.
* **Tools**: **GitHub Actions, Docker, GitHub Webhook**.

## **3.6 Continuous Deployment (CD)**

* **Description**: Deploy Dockerized applications to **AWS ECR**.
* **Functional Requirements**:
  * **Push Docker image**s to **AWS ECR** (Elastic Container Registry).
  * Deploy images to **EC2** with the latest update.
  * Handle deployment rollbacks on failure.
* **Tools**: **Github Actions, Docker, Terraform, Ansible, AWS.**

## **3.7 Infrastructure Management**

* **Description**: Provision and manage AWS resources automatically.
* **Functional Requirements**:
  * Define **AWS infrastructure** (e.g., EKS cluster, ECR) using **Terraform**.
  * Apply infrastructure changes during deployment.
  * Tear down resources if deployment is canceled.
* **Tools**: **Terraform, AWS.**

## **3.8 Monitoring**

* **Description**: Track deployment health and performance.
* **Functional Requirements**:
  * Monitor Kubernetes pods for uptime and errors.
  * Expose metrics (e.g., CPU, memory usage) via a dashboard.
  * Send alerts for critical failures (e.g., pod crashes).
* **Tools**: Prometheus, Grafana.

## **3.9 Security Scanning**

* **Description**: Ensure application security during deployment.
* **Functional Requirements**:
  * Scan Docker images for vulnerabilities before deployment.
  * Flag high-severity issues and halt deployment if detected.
  * Provide a report of scan results.
* **Tools**: Snyk, SonarQube (Later).

* * *

# **4\. Non-functional Requirements**

* **Scalability:** The system must support multiple concurrent deployments.
* **Security:** All sensitive data must be encrypted, secured, and registered to AWS using the AMI role for Isolation.
* **Performance:** Pipeline execution time should be optimized.
* **Usability:** A simple, intuitive UI for pipeline management.
* **Availability:** The system should ensure 99.9% uptime.
* **Data Integrity:** User and project data must be securely stored and consistently managed using MongoDB.

* * *

# 5\. System Architecture

## **5.1 Overview**

* **Frontend**: Next.js app hosted on AWS (e.g., S3 with CloudFront) or Vercel.
* **Backend**: FastAPI server running in AWS ECS or EKS.
* **CI/CD**:
  * GitHub Actions for CI (build and test). CD (Deploy to Production)
* **Infrastructure**: AWS EC2 Free Tiers, ECR for Docker images, managed by Terraform.
* **Monitoring**: Prometheus and Grafana integrated with AWS.
* **Security**: Snyk scanning within the pipeline.

#### **5.2 Data Flow**

1. The user logs in via GitHub OAuth (Next.js → FastAPI → GitHub).
2. The user selects a repository (FastAPI fetches via GitHub API).
3. Push the pre-configured pipeline folder using the selected framework to the user’s repository
4. Pipeline triggers (GitHub Actions builds a Docker image, Snyk scans, and logs in to AWS ECR).
5. Deploys to AWS EC2 (Terraform provisions resources).
6. Prometheus monitors and reports the status to FastAPI

#### 5.3 DevOps Pipeline Overview

1. The user will push the code to the GitHub repository.
2. The user will then choose the repository to deploy the code.
3. Our software will generate a Terraform Docker image and configure a pipeline with GitHub Actions.
4. GitHub will initiate the deployment to AWS.
5. The created image will be stored in the Amazon ECR (Elastic Container Registry).
6. The image uploaded to ECR will be built on the server.

![](https://t9012256541.p.clickup-attachments.com/t9012256541/a00f7edc-eee7-45e9-afa0-7b7434900a83/devops-Page-2.drawio.png)

#### 5.4 Cloud Architecture Overview

#### ![](https://t9012256541.p.clickup-attachments.com/t9012256541/86ca91f5-08c6-4153-ae9e-0517d5f095fd/aws.drawio.png)

* * *

### **7\. Constraints**

* Limited to AWS as the cloud provider for the MVP.
* Supports only Node.js and Python projects initially.
* Assume that the user code is valid and has started the deployment process on the cloud.
* Using EC2 free tiers in the MVP stage (Limited Resources)
* We will simplify the deployment process by using EC2 Free Tiers and GitHub Actions for the CI/CD pipeline instead of Kubernetes and Jenkins in the MVP.

* * *

### **10\. Acceptance Criteria**

* Users can deploy a Node.js or Python app from GitHub to AWS in <10 minutes.
* Deployment succeeds without manual intervention for valid projects.
* The monitoring dashboard shows uptime and errors post-deployment.
* No critical vulnerabilities were detected by Snyk.
* When users change their code and push it to the repository, the code is automatically deployed to production.

* * *

# Backend Architecture

The backend architecture is designed to handle the core logic of automating deployments from **GitHub** to **AWS**, **managing user authentication**, **repository interactions**, and **deployment processes**, as well as **monitoring**. It is built using **FastAPI**, a modern web framework for building APIs, and **MongoDB**, a **NoSQL database** for flexible and scalable data storage. The backend serves as the central hub for coordinating all operations, ensuring a seamless experience for users while abstracting away the complexities of DevOps and cloud infrastructure.

## Components

The backend is structured into **four main components**, each responsible for a distinct aspect of the deployment automation process.

### **1\. Authentication Component**

* Manages user login and authentication using GitHub OAuth, ensuring secure access to the user’s GitHub account and repositories.
* Handles the OAuth flow, securely stores access tokens, and retrieves user information from GitHub.

#### Workflow

* **Login Initiation**: The user clicks "**Login with GitHub**" on the frontend, triggering a request to the backend.
* **OAuth Redirection**: The backend redirects the user to **GitHub’s OAuth authorization page**, providing a client ID and redirect URI.
* **Callback Handling**: After user approval, GitHub redirects to the backend’s **`/auth/callback endpoint`** with an **authorization code**.
* **Token Exchange**: The backend sends a POST request to GitHub’s token endpoint to exchange the code for an access token.
* **Data Storage**: The access token is **encrypted** (using **AES-256**) and stored in the Users collection in MongoDB alongside the user’s GitHub ID and email, eg.
* **Session Management**: A session token is generated and sent to the front end to authenticate subsequent API requests.

![](https://t9012256541.p.clickup-attachments.com/t9012256541/dbff43a6-415c-40b5-9491-5b28ad8c04c0/Screenshot%20from%202025-03-06%2000-35-49.png)

### 2\. Repositories Component

* Handles the management of **users’ GitHub repositories**, allowing users to list and select repositories for deployment.
* Interacts with the **GitHub API** to fetch repository details and store relevant metadata in the database.

#### Workflow

* **Repository Fetching**: Using the user’s stored access token, the backend retrieves a list of repositories from GitHub and stores it in the Repository collection in MongoDB.
* **Detailed Analysis**: When a repository is selected, the backend **fetches detailed metadata** (e.g., **programming language**) and analyzes key files (e.g., **package.json** for **Node.js** or **requirements.txt** for Python).
* **Data Persistence**: Repository details are updated in MongoDB for quick access.

![](https://t9012256541.p.clickup-attachments.com/t9012256541/3f29433c-1d5c-433d-ad19-b70b1938495d/Screenshot%20from%202025-03-06%2000-46-38.png)

#### **GitHub Endpoints Utilized**

* **`GET /user/repos`**: Retrieves the user’s repository list.
* **`GET /repos/{owner}/{repo}`**: Fetches metadata for a specific repository.
* **`GET /repos/{owner}/{repo}/contents/{path}`**Accesses file contents for technology stack analysis.

### 3\. Deployments Component

* Responsible for initiating and **tracking the deployment process**, including **adding pre-configured pipelines** to the user’s repository and triggering deployments.
* Selects the appropriate pipeline based on the **repository’s technology stack** and manages the deployment lifecycle.

#### POST Workflow

* **Request Initiation**: The **user sends a POST request** to **`/api/deployments`** with a **repository ID** and **deployment configuration**.
* **Stack Detection**: The backend analyzes the repository to **identify the technology stack** (e.g., **Flask**, **Node.js**).
* **Pipeline Selection**: A **pre-configured pipeline** (e.g., from **`/pipelines/Backend/Flask-pipeline`**) is selected, including **GitHub Actions workflows** and a **Dockerfile and Terraform.**
* **Pipeline Integration**: These files are added to the repository via **GitHub’s content API**.
* **Webhook Setup**: A GitHub Webhook is configured to trigger the pipeline on code pushes.
* **Status Tracking**: Deployment details and status are stored in the Deployments collection.

#### Update Workflow

* **Code Push**: When the user updates a deployed repository, the **GitHub Webhook** triggers the pre-existing GitHub Actions workflow.
* **Build and Deploy**: The workflow builds, tests, and deploys the application to AWS if it is successful.
* **Status Update**: The backend updates the deployment status in MongoDB.

![](https://t9012256541.p.clickup-attachments.com/t9012256541/4c7a59d4-66b4-47c7-aab9-129c9d254187/Screenshot%20from%202025-03-06%2001-39-15.png)

### Monitoring Integration

* **After deployment**, the backend retrieves **monitoring data** (e.g., from **Prometheus**).
* This data is stored in the **monitoring collection** and made available on the front end for display.

#### Workflow

* **Setup**: Post-deployment, the backend configures monitoring tools (e.g., Prometheus) to track metrics like CPU usage and response time.
* **Data Collection**: Metrics are periodically fetched via Prometheus’s API and stored in the Monitoring collection.
* **User Access**: Monitoring data is accessible via a dedicated API endpoint.

![](https://t9012256541.p.clickup-attachments.com/t9012256541/d83b4f1a-4767-4540-b598-21f87d2052b1/Screenshot%20from%202025-03-06%2001-46-50.png)

* * *

## Pre-configured Pipelines

Organizing pre-configured pipelines effectively in a clear, modular directory structure and categorizing them by **application type** and subsequently by **framework enables us to easily maintain and scale the CI/CD pipelines.**

### **Advantages of Your Proposed Structure**

1. **Clarity & Organization:** It is Easy to locate and manage pipeline templates for specific frameworks.
2. **Scalability:** It is Simple to add new frameworks or technologies (e.g., `/Backend/Django-pipline/` or `/Frontend/Vue-pipline/`).
3. **Modular Design:** Each framework can have its own specific configurations without affecting others.

### Directory Structure

```plain
Pipelines/
│
├── Backend/
│   ├── FastAPI/
│   │   ├── dockerfile
│   │   ├── terraform.tf
│   │   ├── github-actions.yml
│
├── Frontend/
│   ├── React/
│   │   ├── Dockerfile
│   │   ├── terraform.tf
│   │   ├── github-actions.yml
├── Database/
│   ├── MongoDB/
│   │   ├── terraform.tf
│   │   ├── backup-script.sh
│   │   └── monitoring-config.yaml
├── Common/
│   ├── Monitoring/
│   │   ├── prometheus-config.yaml
│   │   ├── grafana-dashboard.json
│   ├── Security/
│   │   ├── snyk-global-config.json
│   │   └── vault-setup.sh
```

**Example**

When the **new deployer triggers**, the backend will **retrieve the pipeline folder and upload it** to the repository. For example, if the repository we need to deploy is **Flask**, the backend will go to the **`/pipelines/Backend/Flask-pipeline/`** **folder and return it**.

* * *

## Database Schema

The backend uses **MongoDB** with the following collections to store and manage data

### 1\. Users Collection

**Purpose**: Stores authenticated user information, including GitHub authentication details and session management.

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "github_id": "12345678",
  "github_access_token": "<encrypted-token>",
  "email": "user@example.com",
  "session_token": "xyz789-session-token",
  "created_at": "2025-03-05T10:00:00Z",
  "updated_at": "2025-03-05T10:00:00Z"
}
```

#### Notes

* **`session_token`**: A unique token for authenticating API requests after login.
* **`created_at`** and **`updated_at`**Timestamps are used to track account creation and updates.

### 2\. Repositories Collection

**Purpose**: Tracks user repositories and their metadata for deployment.

```json
{
  "_id": "507f191e810c19729de860ea",
  "user_id": "507f1f77bcf86cd799439011",
  "repository_id": "987654321",
  "root_folder": "path/backend/app/"
  "name": "my-app",
  "owner": "username",
  "tech_stack": "Flask",
  "deployment_status": "pending or failed or success ",
  "last_analyzed_at": "2025-03-05T12:00:00Z"
}
```

#### Notes

* **`owner`**: The **GitHub username** of the repository owner.
* **`root_folder`** : the **root path for the project** that will deploy it.
* **`tech_stack`**: The detected technology stack (e.g., "**Flask**", "**Node.js**").
* **`last_analyzed_at`**: Timestamp of the last repository analysis.

### 3\. Deployments Collection

**Purpose**: Manages **deployment details**, including **status**, **IAM roles**, and **pipeline configurations**.

```json
{
  "_id": "507f2f88bcf86cd799439022",
  "repository_id": "987654321",
  "deployment_id": "dep-12345",
  "iam_role_arn": "arn:aws:iam::123456789012:role/deployment-dep-12345",
  "pipeline_path": "/pipelines/Backend/Flask-pipeline",
  "root_folder": "path/backend/app/"
  "webhook_id": "wh-45678",
  "config": {
    "env_vars": {
      "FLASK_ENV": "production"
    }
  },
  "status": "completed",
  "start_time": "2025-03-05T14:00:00Z",
  "end_time": "2025-03-05T14:15:00Z",
  "logs": "Deployment completed successfully"
}
```

#### Notes

* **`iam_role_arn`**: The ARN of the **AWS IAM role** created for the deployment.
* **`pipeline_path`**: Path to the **pre-configured pipeline** used (e.g., **`/pipelines/Backend/Flask-pipeline`**).
* **`webhook_id`**: The GitHub Webhook ID for **triggering deployments**.
* **`config`**: The deployment configuration provided by the user.
* **`start_time`** and **`end_time`**: Timestamps for tracking **deployment duration**.

### Monitoring Collection

**Purpose**: Stores monitoring data for deployed applications from Prometheus.

```json
{
  "_id": "507f3f99bcf86cd799439033",
  "deployment_id": "dep-12345",
  "metrics": {
    "cpu_usage_percent": 25.5,
    "memory_usage_mb": 128,
    "response_time_ms": 150
  },
  "logs": "Application running normally",
  "last_updated_at": "2025-03-05T14:20:00Z"
}
```

#### Notes

* **`metrics`**: An object containing **key-value pairs** of **monitoring metrics** (e.g., CPU usage, memory).
* **`last_updated_at`**: Timestamp of the last metrics update.

* * *
