const request = require('./request');

const createdIds = [];

function trackId(id) {
  if (id) createdIds.push(id);
}

async function deleteAllTracked() {
  for (const id of createdIds) {
    await request.delete(`/usuarios/${id}`).catch(() => {});
  }
  createdIds.length = 0;
}

module.exports = { trackId, deleteAllTracked, createdIds };
