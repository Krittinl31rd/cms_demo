const wsClients = [];

function addWsClient(client) {
  wsClients.push(client);
}

function getWsClients() {
  return wsClients;
}

function getWsClientById(id) {
  return wsClients.find((client) => client.id === id);
}

function removeWsClientById(id) {
  const index = wsClients.findIndex((client) => client.id === id);
  if (index !== -1) {
    wsClients.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = {
  addWsClient,
  getWsClients,
  getWsClientById,
  removeWsClientById,
};
