import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

/**
 * GET handler for fetching GitHub repository data
 * Acts as a proxy to the backend API with helpful error messages
 */
export async function GET(
  request: Request,
  { params }: { params: { params: string[] } }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Parse the params to determine what we're fetching
    // The route pattern will be /api/repository/github/[...params]
    // where params could be:
    // - [owner] (fetch user repos)
    // - [owner, repo_name] (fetch specific repo)
    // - [owner, repo_name, 'blobs', branch, sha] (fetch directory structure)
    const paramsObj = await params;
    const pathParams = paramsObj && paramsObj.params ? [...paramsObj.params] : [];
    
    if (pathParams.length === 0) {
      return NextResponse.json(
        { error: 'Missing path parameters' },
        { status: 400 }
      );
    }

    // Construct the backend API path based on the params
    let apiPath = '';
    
    if (pathParams.length === 1) {
      // Just the owner, fetch repositories
      apiPath = `/git/repository/${pathParams[0]}`;
    } else if (pathParams.length === 2) {
      // Owner and repo name, fetch specific repository
      apiPath = `/git/repository/${pathParams[0]}/${pathParams[1]}`;
    } else if (pathParams.length === 5 && pathParams[2] === 'blobs') {
      // Directory structure: [owner, repo_name, 'blobs', branch, sha]
      apiPath = `/git/repository/${pathParams[0]}/${pathParams[1]}/blobs/${pathParams[3]}/${pathParams[4]}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid path parameters' },
        { status: 400 }
      );
    }
    
    // Log the API request for debugging
    console.log(`Proxying GitHub API request to: ${API_URL}${apiPath}`);
    
    // Make the request to the backend API
    const response = await fetch(`${API_URL}${apiPath}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Repository API error: ${response.status} ${response.statusText}`);
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Error response content:', errorText);
      } catch (e) {
        console.error('Could not parse error response text');
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch repository data: ${response.statusText}`,
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GitHub repository API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repository data' },
      { status: 500 }
    );
  }
} 