# Easy Deploy - Frontend

## Overview

This is the frontend for the Easy Deploy application. It is built using Next.js and provides a user interface for managing deployments.

## Prerequisites

-   Node.js (>=18)
-   pnpm

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```

2.  Navigate to the frontend directory:

    ```bash
    cd Frontend
    ```

3.  Install dependencies:

    ```bash
    pnpm install
    ```

## Running the Application

To run the application in development mode, use the following command:

```bash
pnpm dev
```

This will start the development server and open the application in your browser at `http://localhost:3000`.

## Pages

### Login Page

-   Path: `/login`
-   Description: Allows users to log in to the application.

### Dashboard

-   Path: `/dashboard`
-   Description: The main dashboard for managing deployments.

    -   **Projects:**
        -   Path: `/dashboard/projects`
        -   Description: Lists all projects with grid and list views, with fallback to GitHub repositories when backend is unavailable.
        -   **New Project:**
            -   Path: `/dashboard/projects/new`
            -   Description: Allows users to create a new project from GitHub repositories.
        -   **Project Details:**
            -   Path: `/dashboard/projects/[id]`
            -   Description: Shows detailed information about a specific project.
        -   **Project Logs:**
            -   Path: `/dashboard/projects/[id]/logs`
            -   Description: Shows logs for a specific project.
        -   **Project Analytics:**
            -   Path: `/dashboard/projects/[id]/analytics`
            -   Description: Shows analytics for a specific project.
        -   **Project Deployments:**
            -   Path: `/dashboard/projects/[id]/deployments`
            -   Description: Shows deployment history for a specific project.
    -   **Deployments:**
        -   Path: `/dashboard/deployments`
        -   Description: Lists all deployments.
        -   **Deployment Details:**
            -   Path: `/dashboard/deployments/[id]`
            -   Description: Shows details for a specific deployment.
    -   **Settings:**
        -   Path: `/dashboard/settings`
        -   Description: Allows users to configure their settings.

## Components

### Project Components

-   **ProjectGrid**: Grid view of projects with error handling and GitHub fallback
-   **ProjectList**: Table view of projects with consistent error handling
-   **RecentDeployments**: Shows recent deployment activity with fallback to GitHub commits
-   **ActivityFeed**: Shows recent account activity
-   **DeploymentStats**: Overview statistics for deployments
-   **ResourceUsage**: Resource consumption monitoring

### Error Handling

Both ProjectGrid and ProjectList components implement consistent error handling:
- Loading states with skeleton placeholders
- Error states with retry functionality
- Graceful fallback to GitHub repositories when backend is unavailable
- User-friendly error messages and toast notifications

### Authentication

- Token-based authentication with GitHub
- Automatic token refresh and error handling
- Fallback mechanisms when authentication fails

## Hooks

The frontend uses custom hooks for:

-   Mobile detection (`Frontend/hooks/use-mobile.tsx`)
-   Toast notifications (`Frontend/hooks/use-toast.ts`)

## Contributing

Contributions are welcome! Please submit a pull request with your changes.
