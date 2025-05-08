import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Fetch the GitHub user profile from backend API
    const response = await fetch(`${API_URL}/users/github/me/`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    const userData = await response.json();
    
    // Return formatted user profile data
    return NextResponse.json({
      id: userData.id,
      name: userData.name || userData.login,
      username: userData.login,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      profileUrl: userData.html_url,
      bio: userData.bio,
      company: userData.company,
      location: userData.location,
      twitterUsername: userData.twitter_username,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}