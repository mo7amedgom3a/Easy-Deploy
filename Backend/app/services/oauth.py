import httpx
from config.settings import settings
import logging

async def get_github_user(code: str):
    async with httpx.AsyncClient() as client:
        try:
            # First get the access token
            token_resp = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.CLIENT_ID,
                    "client_secret": settings.CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.REDIRECT_URI,
                    "scope": "admin:repo_hook repo",
                },
                timeout=10.0  # Add timeout to prevent hanging requests
            )
            
            # Check for HTTP error and log response for debugging
            if token_resp.status_code != 200:
                print(f"GitHub OAuth token request failed with status {token_resp.status_code}: {token_resp.text}")
                print(f"Request data: client_id={settings.CLIENT_ID}, redirect_uri={settings.REDIRECT_URI}")
                return None
                
            token_data = token_resp.json()
            print(f"Token response: {token_data.keys()}")
            
            # Check for error response from GitHub
            if "error" in token_data:
                print(f"GitHub OAuth error: {token_data.get('error')}, {token_data.get('error_description')}")
                return None
                
            access_token = token_data.get("access_token")
            if not access_token:
                print("No access token in GitHub response")
                return None

            # Now get the user data
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                timeout=10.0
            )
            
            if user_resp.status_code != 200:
                print(f"GitHub user API request failed with status {user_resp.status_code}: {user_resp.text}")
                return None
                
            user_data = user_resp.json()
            user_data["access_token"] = access_token
            
            return user_data
            
        except Exception as e:
            print(f"Exception in get_github_user: {str(e)}")
            return None
