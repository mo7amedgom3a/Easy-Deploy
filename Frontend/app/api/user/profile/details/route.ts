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
    
    // Fetch the basic GitHub user profile from backend API
    const userResponse = await fetch(`${API_URL}/users/github/me/`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    
    // Also fetch repository data for this user
    const reposResponse = await fetch(`${API_URL}/git/repository/${userData.login}`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    let repositories = [];
    if (reposResponse.ok) {
      const reposData = await reposResponse.json();
      repositories = Array.isArray(reposData) ? reposData : 
                    (reposData.repositories && Array.isArray(reposData.repositories)) ? 
                      reposData.repositories : [];
    }
    
    // Fetch user's GitHub activity
    const activityResponse = await fetch(`${API_URL}/users/github/me/activity`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    let activity = [];
    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      activity = Array.isArray(activityData) ? activityData : 
                (activityData.events && Array.isArray(activityData.events)) ? 
                  activityData.events : [];
    }
    
    // Return comprehensive user profile data
    return NextResponse.json({
      user: {
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
        following: userData.following,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        plan: userData.plan || null,
      },
      repositories: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        fork: repo.fork,
        htmlUrl: repo.html_url,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        watchersCount: repo.watchers_count,
        size: repo.size,
        defaultBranch: repo.default_branch,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
      })),
      activity: activity.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching user profile details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile details' },
      { status: 500 }
    );
  }
}