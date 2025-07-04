const logCache = new Map();

function shouldLog(room_id, device_id, control_id, intervalSeconds) {
  const key = `${room_id}_${device_id}_${control_id}`;
  const now = Date.now();
  const lastLogged = logCache.get(key) || 0;

  if (now - lastLogged >= intervalSeconds * 1000) {
    logCache.set(key, now);
    return true;
  }
  return false;
}

module.exports = {
  shouldLog,
};
