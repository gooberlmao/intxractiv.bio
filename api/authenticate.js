// api/authenticate.js
const axios = require('axios');
const crypto = require('crypto');

// Helper function to generate a unique nonce
const generateNonce = () => {
  return crypto.randomBytes(16).toString('hex');  // Generates a random 32-character string
};

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { sessionTicket } = req.body;  // The session ticket sent from the client (Unity game)

    if (!sessionTicket) {
      return res.status(400).json({ message: 'Session ticket is required' });
    }

    try {
      // Step 1: Verify the session ticket with PlayFab
      const response = await axios.post(`https://{{your_playfab_title_id}}.playfabapi.com/Client/ValidateSessionTicket`, {
        TitleId: process.env.PLAYFAB_TITLE_ID, // Use environment variable for PlayFab Title ID
        SessionTicket: sessionTicket
      });

      // Step 2: Check if the PlayFab session is valid
      if (response.data.Status === 'OK') {
        // Step 3: Check for fake or spammed players (you can implement custom logic here)
        if (isFakePlayer(response.data.UserInfo)) {
          // Optionally, you can delete the player from PlayFab or flag the account
          await axios.post(`https://{{your_playfab_title_id}}.playfabapi.com/Admin/DelistUsers`, {
            PlayFabId: response.data.UserInfo.PlayFabId,
            // Additional logic for deletion or flagging
          });

          return res.status(403).json({ message: 'Fake player detected, account deleted' });
        }

        // Step 4: Generate a nonce for the player
        const nonce = generateNonce();

        // Optionally, store the nonce for a limited time (e.g., 15 minutes) in a temporary DB or cache

        return res.json({
          photonToken: response.data.UserInfo.PlayFabId,  // The token for Photon (could be PlayFabId or other)
          nonce: nonce  // Send the nonce back to the client
        });
      } else {
        return res.status(401).json({ message: 'Invalid session ticket' });
      }
    } catch (error) {
      console.error("Error verifying session ticket:", error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};

// Custom logic to detect fake players (this can be adjusted to your needs)
function isFakePlayer(userInfo) {
  // Example checks based on user info (you can customize this)
  if (userInfo.AccountInfo.TitlePlayerAccount || userInfo.AccountInfo.IsBanned) {
    return true;
  }
  // Additional spam/fraud logic can go here
  return false;
}
