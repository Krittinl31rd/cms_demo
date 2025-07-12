const wsClients = [];

function addWsClient(client) {
  wsClients.push(client);
}

function getWsClients() {
  return wsClients;
}

function removeWsClientById(id) {
  const index = wsClients.findIndex((c) => c.id === id);
  if (index !== -1) {
    wsClients.splice(index, 1);
    console.log(`[WS] Removed client id=${id}`);
    return true;
  }
  return false;
}

function getWsClientById(id) {
  return wsClients.find((client) => String(client.id) === String(id));
}

function getWsClientByUserId(userId) {
  const client = wsClients.find(
    (client) => client.user && String(client.user.id) === String(userId)
  );
  return client;
}

function getWsClientByRoleId(roleId) {
  return wsClients.filter(
    (client) => client.user && String(client.user.role_id) === String(roleId)
  );
}

// === WebSocket Send Helpers ===

function isSocketOpen(socket) {
  return socket && socket.readyState === 1; // WebSocket.OPEN
}

// Broadcast to all connected clients
function sendWsMessageToAll(data) {
  const message = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (isSocketOpen(client.socket)) {
      client.socket.send(message);
    }
  });
}

// Send to a specific client by client.id
function sendWsMessageToClientById(id, data) {
  const client = getWsClientById(id);
  if (client && isSocketOpen(client.socket)) {
    client.socket.send(JSON.stringify(data));
    return true;
  }
  return false;
}

// Send to a client by user ID
function sendWsMessageToUser(userId, data) {
  const client = getWsClientByUserId(userId);
  if (client && isSocketOpen(client.socket)) {
    client.socket.send(JSON.stringify(data));
    return true;
  } else {
    return false;
  }
}

// Send to all clients by role ID
function sendWsMessageToRole(roleId, data) {
  const message = JSON.stringify(data);
  const roleClients = getWsClientByRoleId(roleId);
  roleClients.forEach((client) => {
    client.socket.send(message);
  });
  return roleClients.length > 0;
}

// === Exports ===

module.exports = {
  addWsClient,
  getWsClients,
  getWsClientById,
  getWsClientByUserId,
  getWsClientByRoleId,
  removeWsClientById,
  sendWsMessageToAll,
  sendWsMessageToClientById,
  sendWsMessageToUser,
  sendWsMessageToRole,
};
