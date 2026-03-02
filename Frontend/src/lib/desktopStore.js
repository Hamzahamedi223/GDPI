const inDesktop =
  typeof window !== 'undefined' && typeof window.desktopAPI !== 'undefined';

const localStorageKey = 'gdpi-local-records';

const webFallback = {
  getAllRecords() {
    const raw = localStorage.getItem(localStorageKey);
    return raw ? JSON.parse(raw) : [];
  },
  addRecord(payload) {
    const current = this.getAllRecords();
    const entry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    localStorage.setItem(localStorageKey, JSON.stringify([...current, entry]));
    return entry;
  },
  removeRecord(id) {
    const current = this.getAllRecords();
    const next = current.filter((item) => item.id !== id);
    localStorage.setItem(localStorageKey, JSON.stringify(next));
    return next;
  },
};

export const desktopStore = {
  getAllRecords: async () => {
    if (inDesktop) return window.desktopAPI.getAllRecords();
    return webFallback.getAllRecords();
  },
  addRecord: async (payload) => {
    if (inDesktop) return window.desktopAPI.addRecord(payload);
    return webFallback.addRecord(payload);
  },
  removeRecord: async (id) => {
    if (inDesktop) return window.desktopAPI.removeRecord(id);
    return webFallback.removeRecord(id);
  },
};

export default desktopStore;
