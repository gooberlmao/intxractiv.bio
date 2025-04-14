// api/photon-auth.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { sessionTicket } = req.body;

    if (!sessionTicket) {
      return res.status(400).json({ message: 'Session ticket is required' });
    }

    try {
      // Validate PlayFab session ticket
      const response = await axios.post('https://playfabapi.com/Client/ValidateSessionTicket', {
        TitleId: '', // Replace with your PlayFab Title ID
        SessionTicket: sessionTicket
      });

      if (response.data.Status === 'OK') {
        // If valid, return the PlayFab ID as the Photon token
        return res.json({ photonToken: response.data.UserInfo.PlayFabId });
      } else {
        return res.status(401).json({ message: 'Invalid session ticket' });
      }
    } catch (error) {
      console.error('Error validating session ticket:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
