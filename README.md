# Easy Deploy

## Table of Contents

- [Project Description](#project-description)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)

## Project Description

Easy Deploy is a full-stack application that simplifies the deployment process. The backend is built with Python and FastAPI, while the frontend is built with Next.js.

## Backend Setup

1. Navigate to the `Backend/app` directory:

    ```bash
    cd Backend/app
    ```

2. Create a virtual environment:

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Configure environment variables:

    Create a `.env` file in the `Backend/app` directory and add any necessary environment variables. For example:

    ```bash
    CONNECTION_STRING=your_database_url
    DATABASE_NAME=
    COLLECTION_NAME=
    ```

    Create the file if it doesn't already exist.

6. Run the FastAPI application:

    ```bash
    uvicorn main:app --reload
    ```

## Project Structure

```plaintext
Easy-Deploy/
├── Backend/       # Backend application (FastAPI)
│   ├── app/       # FastAPI application source code
│   ├── Dockerfile # Docker configuration for the backend
│   └── README.md  # Backend-specific README
├── Frontend/      # Frontend application (Next.js)
│   ├── app/       # Next.js application source code
│   ├── components/ # Reusable React components
│   └── README.md  # Frontend-specific README
├── LICENSE        # License information
└── README.md      # Root README (this file)
```

## Deployment

To deploy the application, you will need to containerize the backend and frontend using Docker. Here are the steps:

1. Build Docker images for the backend and frontend:

    ```bash
    cd Backend/app
    docker build -t backend:latest .
    cd ../../Frontend
    docker build -t frontend:latest .
    ```

2. Push the images to a container registry such as Docker Hub or Google Container Registry:

    ```bash
    docker push backend:latest
    docker push frontend:latest
    ```

    Make sure the image names correspond to the names used when pushing to the container registry.

4. Deploy the application to a cloud platform using Docker Compose or Kubernetes. Here is an example `docker-compose.yml` file:

    ```yaml
    version: "3.9"
    services:
      backend:
        image: backend:latest
        ports:
          - "8000:8000"
        environment:
          - DATABASE_URL=your_database_url
      frontend:
        image: frontend:latest
        ports:
          - "3000:3000"
        environment:
          - NEXT_PUBLIC_API_URL=your_api_url
    ```

    To deploy the application using Docker Compose:

    ```bash
    docker-compose up -d
    ```

## Contributing

We welcome contributions to the project! Here are the steps to contribute:

1. Fork the repository on GitHub.
2. Create a branch for your new feature or bug fix:

    ```bash
    git checkout -b my-new-feature
    ```

3. Commit your changes with a clear description:

    ```bash
    git commit -m "Add my new feature"
    ```

4. Push your changes to your forked repository:

    ```bash
    git push origin my-new-feature
    ```

5. Submit a pull request to the main repository.

## Frontend Setup

1. Navigate to the `Frontend/` directory:

    ```bash
    cd Frontend/
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure environment variables:

    Create a `.env.local` file in the `Frontend/` directory and add any necessary environment variables. For example:

    ```bash
    NEXT_PUBLIC_API_URL=your_api_url
    ```

    Create the file if it doesn't already exist.

5. Run the Next.js application:

    ```bash
    npm run dev
    ```
