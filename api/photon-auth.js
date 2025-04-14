// api/photon-auth.js
const axios = require('axios');

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method === 'POST') {
    const { sessionTicket } = req.body;

    // Ensure session ticket is provided
    if (!sessionTicket) {
      return res.status(400).json({ message: 'Session ticket is required' });
    }

    try {
      console.log("Starting PlayFab session ticket validation");

      // Replace with your PlayFab Title ID environment variable
      const response = await axios.post('https://{{your_playfab_title_id}}.playfabapi.com/Client/ValidateSessionTicket', {
        TitleId: process.env.PLAYFAB_TITLE_ID, // Use environment variables for security
        SessionTicket: sessionTicket,
      });

      console.log("Response from PlayFab:", response.data);

      if (response.data.Status === 'OK') {
        // If valid, return the PlayFab ID as the Photon token
        return res.json({ photonToken: response.data.UserInfo.PlayFabId });
      } else {
        return res.status(401).json({ message: 'Invalid session ticket' });
      }
    } catch (error) {
      console.error("Error validating session ticket:", error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    // Handle invalid HTTP methods
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
