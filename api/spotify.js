export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID
  const CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing Spotify credentials' })
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.status(200).json({ access_token: data.access_token })
  } catch (error) {
    console.error('Spotify token error:', error)
    res.status(500).json({ error: 'Failed to get Spotify token' })
  }
}