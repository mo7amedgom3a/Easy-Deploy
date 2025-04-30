import { NextApiRequest, NextApiResponse } from 'next';
import { API_URL } from "@/lib/constants";

// Using absolute URL to ensure it works from browser context
const LOGOUT_ENDPOINT = `${API_URL}/auth/logout`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const frontendToken = req.headers.authorization?.split(' ')[1];
    console.log(`[API Route /api/logout] Received request. Token present: ${!!frontendToken}`);

    if (!frontendToken) {
      console.log('[API Route /api/logout] No token provided by frontend.');
      // Still proceed with client logout, but don't call backend
      return res.status(200).json({ message: 'Client logout successful (no token)' });
    }

    try {
      console.log(`[API Route /api/logout] Attempting backend logout POST to: ${LOGOUT_ENDPOINT}`);
      const backendResponse = await fetch(LOGOUT_ENDPOINT, { // Renamed variable for clarity
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${frontendToken}`, // Forward the token
        },
        // Add a timeout in case the backend is unresponsive
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      console.log(`[API Route /api/logout] Backend response status: ${backendResponse.status}`);

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('[API Route /api/logout] Backend logout successful:', backendData.message);
        res.status(200).json({ message: 'Full logout successful' });
      } else {
        const errorText = await backendResponse.text();
        console.error(`[API Route /api/logout] Backend logout failed: ${backendResponse.status} ${backendResponse.statusText}. Response: ${errorText}`);
        // Still return 200 to the client, as we want the client to proceed with its logout steps
        res.status(200).json({ message: 'Client logout successful, but backend logout failed' });
      }
    } catch (error: any) { // Catch specific errors
       if (error.name === 'TimeoutError') {
         console.error('[API Route /api/logout] Error calling backend: Request timed out.');
       } else {
         console.error('[API Route /api/logout] Error calling backend:', error.message || error);
       }
      // Still return 200 to ensure client proceeds with logout
      res.status(200).json({ message: 'Client logout successful, but backend communication failed' });
    }
  } else {
    console.log(`[API Route /api/logout] Received non-POST request: ${req.method}`);
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
