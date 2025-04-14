# APIs

This file provides a list of API endpoints for the backend, designed to be imported into Insomnia for easy testing.

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

### GET /users/
- **Description**: Retrieves all users.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /users/me
- **Description**: Retrieves the current user's information.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /users/{user_id}
- **Description**: Retrieves a specific user by ID.
- **Path Parameters**:
  - `user_id` (string): The ID of the user.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /users/github/me/
- **Description**: Retrieves the current user's GitHub information.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /users/github/me/access_key
- **Description**: Retrieves the current user's GitHub access key.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

## Authentication Endpoints

### GET /auth/login
- **Description**: Initiates the login process.

### GET /auth/github/callback
- **Description**: Handles the GitHub callback after user authentication.
- **Query Parameters**:
  - `code` (string): The authorization code from GitHub.

## Git Repository Endpoints

### GET /git/repository/{owner}
- **Description**: Fetches the repositories of the authenticated user.
- **Path Parameters**:
  - `owner` (string): The owner of the repositories.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /git/repository/{owner}/{repo_name}
- **Description**: Fetches a specific repository by its name.
- **Path Parameters**:
  - `owner` (string): The owner of the repository.
  - `repo_name` (string): The name of the repository.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /git/repository/{owner}/{repo_name}/commits/{branch}
- **Description**: Fetches the latest commit from a specific branch of a repository.
- **Path Parameters**:
  - `owner` (string): The owner of the repository.
  - `repo_name` (string): The name of the repository.
  - `branch` (string): The branch name.
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```

### GET /git/repository/{owner}/{repo_name}/blobs/{branch}/{sha}
- **Description**: Fetches the blob tree structure of a repository.
- **Path Parameters**:
  - `owner` (string): The owner of the repository.
  - `repo_name` (string): The name of the repository.
  - `branch` (string): The branch name.
  - `sha` (string): The SHA of the blob.
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
