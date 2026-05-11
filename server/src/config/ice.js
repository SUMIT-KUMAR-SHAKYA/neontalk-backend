const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp',
    ],
    username: process.env.TURN_USERNAME || 'openrelayproject',
    credential: process.env.TURN_CREDENTIAL || 'openrelayproject',
  },
];

module.exports = ICE_SERVERS;
