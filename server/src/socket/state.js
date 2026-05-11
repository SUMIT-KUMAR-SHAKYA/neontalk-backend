// In-memory state for matching
// For a multi-server setup, you would use Redis instead.

const queue = [];
const activeUsers = new Map();

module.exports = {
  queue,
  activeUsers,
};
