import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

/**
 * GET handler for fetching GitHub user repositories
 * Acts as a proxy to the backend API with helpful error messages
 */
export async function GET(request: Request) {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      console.error('No authentication token found in cookies');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Get the username from query param
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    
    if (!username) {
      console.error('Missing username parameter in repository request');
      return NextResponse.json(
        { error: 'Missing username parameter' },
        { status: 400 }
      );
    }
    
    // Construct the API URL for fetching repositories
    const apiUrl = `${API_URL}/git/repository/${username}`;
    console.log(`Fetching repositories for user: ${username}`);
    console.log(`Using API URL: ${apiUrl}`);
    
    // Make the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      // Don't cache this request
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const status = response.status;
      console.error(`Repository fetch error: ${status} ${response.statusText}`);
      
      // Try to extract more detailed error info
      let errorText = '';
      let errorData = null;
      
      try {
        errorText = await response.text();
        console.error('Error response content (raw):', errorText);
        
        // Try to parse as JSON if possible
        try {
          errorData = JSON.parse(errorText);
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Not JSON response, using as text:', errorText);
        }
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      // Handle specific error cases
      if (status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed. Please log in again.', details: errorText },
          { status: 401 }
        );
      } else if (status === 403) {
        return NextResponse.json(
          { error: 'Access forbidden. You may need additional permissions.', details: errorText },
          { status: 403 }
        );
      } else if (status === 404) {
        return NextResponse.json(
          { error: 'No repositories found for this user.', details: errorText },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch repositories: ${response.statusText}`,
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    // Get the response text first to debug
    const responseText = await response.text();
    console.log('Repository API response text:', responseText);
    
    let data;
    try {
      // Try to parse the JSON response
      data = JSON.parse(responseText);
      console.log('Parsed repository data:', typeof data, Array.isArray(data) ? `Array[${data.length}]` : 'Not an array');
    } catch (error) {
      console.error('Failed to parse repository response as JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in repository response', rawResponse: responseText },
        { status: 500 }
      );
    }
    
    // Validate the response data
    if (!Array.isArray(data)) {
      console.error('API returned non-array response for repositories:', data);
      // Try to extract repositories if there's a specific property that contains them
      if (data && typeof data === 'object') {
        if (data.repositories && Array.isArray(data.repositories)) {
          console.log('Found repositories in data.repositories property');
          return NextResponse.json(data.repositories);
        } else if (data.results && Array.isArray(data.results)) {
          console.log('Found repositories in data.results property');
          return NextResponse.json(data.results);
        } else if (data.items && Array.isArray(data.items)) {
          console.log('Found repositories in data.items property');
          return NextResponse.json(data.items);
        }
      }
      
      return NextResponse.json(
        { error: 'Invalid repository data format returned from API', data },
        { status: 500 }
      );
    }
    
    console.log(`Returning ${data.length} repositories`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GitHub repository API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 