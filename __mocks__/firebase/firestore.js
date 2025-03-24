export const getFirestore = jest.fn();
export const collection = jest.fn();
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }));
export const updateDoc = jest.fn();
export const addDoc = jest.fn(() => Promise.resolve({ id: 'mock-id' }));
export const deleteDoc = jest.fn();
export const doc = jest.fn();
