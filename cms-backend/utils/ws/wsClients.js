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
  return wsClients.filter((client) => String(client.id) === String(id));
}

function getWsClientByUserId(userId) {
  const client = wsClients.filter(
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
  if (wsClients.length == 0) {
    return false;
  }
  wsClients.forEach((client) => {
    if (isSocketOpen(client.socket)) {
      client.socket.send(message);
    }
  });
  return wsClients.length;
}

// Send to a specific client by client.id
function sendWsMessageToClientById(id, data) {
  const clients = getWsClientById(id);
  const message = JSON.stringify(data);
  if (clients.length == 0) {
    return false;
  }
  clients.forEach((client) => {
    if (isSocketOpen(client.socket)) {
      client.socket.send(message);
    }
  });
  return clients;
}

// Send to a client by user ID
function sendWsMessageToUser(userId, data) {
  const clients = getWsClientByUserId(userId);
  const message = JSON.stringify(data);
  if (clients.length == 0) {
    return false;
  }
  clients.forEach((client) => {
    if (isSocketOpen(client.socket)) {
      client.socket.send(message);
    }
  });
  return clients;
}

// Send to all clients by role ID
function sendWsMessageToRole(roleId, data) {
  const clients = getWsClientByRoleId(roleId);
  const message = JSON.stringify(data);
  if (clients.length == 0) {
    return false;
  }
  clients.forEach((client) => {
    if (isSocketOpen(client.socket)) {
      client.socket.send(message);
    }
  });
  return clients;
}

function sendWsMessageToModbusClient(data) {
  const message = JSON.stringify(data);
  const wsModbusClient = getWsClients().find(
    (client) => client.user.role == "gateway"
  );
  if (wsModbusClient == undefined) {
    return false;
  }
  wsModbusClient.socket.send(message);
  return true;
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
  sendWsMessageToModbusClient,
};
