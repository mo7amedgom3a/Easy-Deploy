# APIs

This file provides a list of API endpoints for the backend, designed to be imported into Insomnia for easy testing.

## Authentication Endpoints

### POST /token
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

## User Endpoints

### POST /users/
- **Description**: Creates a new user.
- **Request Body**:
  ```json
  {
    "full_name": "Your Full Name",
    "email": "your_email@example.com",
    "password": "your_password",
    "is_active": true,
    "is_superuser": false
  }
  ```

### GET /users/me
- **Description**: Retrieves the current user's information.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /users/{user_id}
- **Description**: Retrieves a specific user by ID.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

## Git Repository Endpoints

### POST /git_repositories/
- **Description**: Creates a new Git repository.
- **Request Body**:
  ```json
  {
    "name": "Your Repository Name",
    "url": "Your Repository URL",
    "description": "A description of your repository"
  }
  ```
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /git_repositories/
- **Description**: Retrieves all Git repositories.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /git_repositories/{repo_id}
- **Description**: Retrieves a specific Git repository by ID.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

## How to Use

1.  **Install Insomnia**: Download and install Insomnia from [https://insomnia.rest/](https://insomnia.rest/).
2.  **Create a New Collection**: Open Insomnia and create a new collection (e.g., "Easy Deploy API").
3.  **Import from Text**: Copy the content of this file. In Insomnia, click "Create" -> "Import Data" -> "From Text". Paste the content and import.
4.  **Set Environment Variables**:
    *   Configure environment variables in Insomnia for:
        *   `JWT_TOKEN`: After logging in via the `/token` endpoint, copy the token and set it as the value for this variable.
        *   `BASE_URL`: Set this to the base URL of your backend (e.g., `http://localhost:8000`).
5.  **Use the Collection**: You can now use the imported requests, substituting the environment variables where necessary (e.g., in the Authorization header).
