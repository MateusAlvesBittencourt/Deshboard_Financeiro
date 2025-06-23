import { openDB } from 'idb';

const dbPromise = openDB('dashboard-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('transactions')) {
      db.createObjectStore('transactions', { keyPath: 'id' });
    }
  },
});

export async function listarDados() {
  return (await dbPromise).getAll('transactions');
}

export async function salvarDado(dado) {
  return (await dbPromise).put('transactions', dado);
}

export async function atualizarDado(dado) {
  return (await dbPromise).put('transactions', dado);
}

export async function deletarDado(id) {
  return (await dbPromise).delete('transactions', id);
} 