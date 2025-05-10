# Easy-Deploy API Documentation

## Default Endpoints

### GET /

**Description**: Root endpoint that returns basic API information.  
**Parameters**: None  
**Response**: Basic API information and status.

```json
{
  "status": "online",
  "message": "Welcome to Easy-Deploy API"
}
```

## User Endpoints

### GET /users/{user_id}

**Description**: Retrieves a user by their unique ID.  
**Parameters**:

- `user_id` (path): The unique identifier of the user  
**Response**: User information in UserSchema format.

```json
{
  "id": "string",
  "github_id": "string",
  "login": "string",
  "avatar_url": "string",
  "name": "string",
  "email": "string",
  "access_token": "string"
}
```

**Error Responses**:

- 404: User not found

### GET /users/github/{github_id}

**Description**: Retrieves a user by their GitHub ID.  
**Parameters**:

- `github_id` (path): The GitHub identifier of the user  
**Response**: User information in UserSchema format.

```json
{
  "id": "string",
  "github_id": "string",
  "login": "string",
  "avatar_url": "string",
  "name": "string",
  "email": "string",
  "access_token": "string"
}
```

**Error Responses**:

- 404: User not found

### GET /users/

**Description**: Retrieves all users in the system.  
**Parameters**: None  
**Response**: Array of users in UserSchema format.

```json
[
  {
    "id": "string",
    "github_id": "string",
    "login": "string",
    "avatar_url": "string",
    "name": "string",
    "email": "string",
    "access_token": "string"
  }
]
```

### GET /users/github/me/

**Description**: Retrieves current authenticated user's information.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Response**: Current user information in UserSchema format.

```json
{
  "id": "string",
  "github_id": "string",
  "login": "string",
  "avatar_url": "string",
  "name": "string",
  "email": "string",
  "access_token": "string"
}
```

### GET /users/github/me/access_key

**Description**: Retrieves current authenticated user's GitHub access key.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Response**: Access key as string.

```
"github_access_token_string"
```

## AWS User Endpoints

### GET /aws_user/

**Description**: Retrieves all AWS users.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Response**: Array of AWS users in AWSUserSchema format.

```json
[
  {
    "id": "string",
    "github_id": "string",
    "aws_access_key_id": "string",
    "aws_secret_access_key": "string"
  }
]
```

**Error Responses**:

- 404: No AWS users found

### POST /aws_user/

**Description**: Creates a new AWS user for the authenticated user.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Response**: The created AWS user in AWSUserSchema format.

```json
{
  "id": "string",
  "github_id": "string",
  "aws_access_key_id": "string",
  "aws_secret_access_key": "string"
}
```

**Error Responses**:

- 400: Failed to create AWS user

### GET /aws_user/{aws_user_id}

**Description**: Retrieves a specific AWS user by ID.  
**Parameters**:

- `aws_user_id` (path): The unique identifier of the AWS user  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: AWS user information in AWSUserSchema format.

```json
{
  "id": "string",
  "github_id": "string",
  "aws_access_key_id": "string",
  "aws_secret_access_key": "string"
}
```

**Error Responses**:

- 404: AWS user not found

## Authentication Endpoints

### GET /auth/logout

**Description**: Logs out the current user by removing the authorization cookie.  
**Parameters**: None  
**Response**: Logout success message and clears authorization cookie.

```json
{
  "message": "Successfully logged out"
}
```

### POST /auth/logout

**Description**: Logs out the current user through POST request, useful for frontend logout API.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token optional  
**Response**: Logout success message and clears authorization cookie.

```json
{
  "message": "Successfully logged out"
}
```

### GET /auth/login

**Description**: Redirects to GitHub OAuth login page.  
**Parameters**: None  
**Response**: Redirects user to GitHub authentication page.

### GET /auth/github/callback

**Description**: Handles GitHub OAuth callback after user authentication.  
**Parameters**:

- `code` (query): Authorization code from GitHub  
**Response**: JWT token for authenticated user.

```json
{
  "jwt_token": "string"
}
```

**Error Responses**:

- 400: GitHub authentication failed
- 400: User creation failed
- 400: Token creation failed

## Git Repository Endpoints

### POST /git/repository/github-webhook

**Description**: Endpoint for receiving GitHub webhook events.  
**Parameters**: None  
**Request Body**: GitHub webhook payload (JSON)  
**Response**: Webhook receipt confirmation.

```json
{
  "message": "Webhook received successfully"
}
```

### GET /git/repository/{owner}

**Description**: Fetches repositories for the specified owner/organization.  
**Parameters**:

- `owner` (path): GitHub username or organization name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: List of repositories in RepositorySchema format.

```json
[
  {
    "id": "number",
    "name": "string",
    "full_name": "string",
    "description": "string",
    "private": "boolean",
    "html_url": "string",
    "clone_url": "string",
    "default_branch": "string"
  }
]
```

**Error Responses**:

- 500: Server error or GitHub API error

### GET /git/repository/{owner}/{repo_name}

**Description**: Fetches a specific repository by owner and name.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Repository information with detailed metadata.  
**Error Responses**:
- 500: Server error or GitHub API error

### POST /git/repository/{owner}/{repo_name}

**Description**: Saves a specific repository to the system.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Repository save confirmation.  
**Error Responses**:
- 500: Server error

### GET /git/repository/{owner}/{repo_name}/commits/{branch}

**Description**: Fetches the latest commit from a specific branch of a repository.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name
- `branch` (path): Branch name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Latest commit information.  
**Error Responses**:
- 500: Server error

### POST /git/repository/{owner}/{repo_name}/webhook

**Description**: Creates a webhook for a specific repository.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Webhook creation confirmation.  
**Error Responses**:
- 500: Server error

### GET /git/repository/{owner}/{repo_name}/blobs/{branch}/{sha}

**Description**: Fetches the blob tree structure of a repository.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name
- `branch` (path): Branch name
- `sha` (path, optional): Blob SHA identifier  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Repository blob/tree structure.  
**Error Responses**:
- 500: Server error

### POST /git/repository/{owner}/{repo_name}/clone

**Description**: Clones a repository to the local filesystem.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Clone operation status.  
**Error Responses**:
- 500: Server error

### POST /git/repository/{owner}/{repo_name}/pull

**Description**: Pulls the latest changes for a cloned repository.  
**Parameters**:

- `owner` (path): GitHub username or organization name
- `repo_name` (path): Repository name  
**Headers**:
- `Authorization`: Bearer token required  
**Response**: Pull operation status.  
**Error Responses**:
- 500: Server error

## Deployment Endpoints

### POST /deploy/

**Description**: Creates a new deployment for a repository.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Request Body**: DeployCreateSchema (JSON)

```json
{
  "repository_id": "string",
  "framework": "string",
  "branch": "string",
  "settings": {
    "key": "value"
  }
}
```

**Response**: Deploy information in DeploySchema format.

```json
{
  "id": "string",
  "repository_id": "string",
  "user_id": "string",
  "framework": "string",
  "status": "string",
  "created_at": "date-time",
  "updated_at": "date-time",
  "settings": {
    "key": "value"
  }
}
```

**Error Responses**:

- 500: Server error or deployment failure

### GET /deploy/frameworks

**Description**: Retrieves a list of supported frameworks for deployment.  
**Parameters**: None  
**Headers**:

- `Authorization`: Bearer token required  
**Response**: Dictionary of frameworks with their configuration options.

```json
{
  "nodejs": {
    "name": "Node.js",
    "versions": ["14", "16", "18"],
    "settings": ["port", "env"]
  },
  "python": {
    "name": "Python",
    "versions": ["3.8", "3.9", "3.10"],
    "settings": ["requirements", "command"]
  }
}
```

**Error Responses**:

- 500: Server error
