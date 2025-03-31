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
        -   Description: Lists all projects.
        -   **New Project:**
            -   Path: `/dashboard/projects/new`
            -   Description: Allows users to create a new project.
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

The frontend uses a variety of components, including:

-   UI components from `Frontend/components/ui`
-   Dashboard components from `Frontend/components/dashboard`

## Hooks

The frontend uses custom hooks for:

-   Mobile detection (`Frontend/hooks/use-mobile.tsx`)
-   Toast notifications (`Frontend/hooks/use-toast.ts`)

## Contributing

Contributions are welcome! Please submit a pull request with your changes.
