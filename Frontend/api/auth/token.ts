import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Get the token from cookies
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(200).json({ token: null });
  }

  // Return the token only for internal API calls
  return res.status(200).json({ token });
}