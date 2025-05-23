# Easy-Deploy-V.0.1 Backend

A FastAPI-based backend service for the Easy-Deploy project, providing a robust and scalable API infrastructure.

## Features

- FastAPI framework with modern async support
- MongoDB integration with Motor for async database operations
- User authentication and authorization
- RESTful API endpoints
- Docker support for containerization
- Environment-based configuration
- Modular architecture with clear separation of concerns

## Prerequisites

- Python 3.9 or higher
- MongoDB
- Docker

## Project Structure

```
Backend/
├── app/
│   ├── config/         # Configuration settings
│   ├── dependencies/   # FastAPI dependencies
│   ├── interfaces/     # Interface definitions
│   ├── models/         # Data models
│   ├── repositories/   # Database repositories
│   ├── routers/        # API route handlers
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── tests/          # Test files
├── requirements.txt    # Python dependencies
├── dockerfile         # Docker configuration
└── .env              # Environment variables
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend
```

2. Create and activate a virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the `app` directory with the following variables:
```
MONGODB_URL=your_mongodb_url
SECRET_KEY=your_secret_key
```

## Running the Application

### Local Development

```bash
cd app
uvicorn main:app --reload
or
fastapi run dev
```

The API will be available at `http://localhost:8000`

### Docker Deployment

Build the Docker image:
```bash
docker build --no-cache -t easy-deploy-backend .
```

Run the container:
```bash
docker run -d -p 8000:8000 --network host easy-deploy-backend
```

## API Documentation

Once the application is running, you can access:
- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Development

The project follows a clean architecture pattern with the following layers:
- Routers: Handle HTTP requests and responses
- Services: Implement business logic
- Repositories: Handle data access
- Models: Define data structures
- Schemas: Define API request/response models

## Testing

Run tests using pytest:
```bash
pytest app/tests/
```
