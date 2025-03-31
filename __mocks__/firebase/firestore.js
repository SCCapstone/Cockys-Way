export const getFirestore = jest.fn();
export const collection = jest.fn();
export const doc = jest.fn();

export const getDocs = jest.fn((ref) => {
  if (ref._path?.segments?.includes("assignments")) {
    return Promise.resolve({
      forEach: (callback) => {
        callback({
          data: () => ({
            title: "Midterm Essay",
            courseCode: "CS101",
            dueDate: new Date("2024-09-20"),
          }),
        });
      },
    });
  }

  return Promise.resolve({
    docs: [
      {
        id: "course1",
        data: () => ({
          name: "Test Course",
          code: "CS101",
          section: "001",
        }),
      },
    ],
  });
});

export const getDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => false,
    data: () => ({}),
  })
);

export const updateDoc = jest.fn();
export const addDoc = jest.fn(() => Promise.resolve({ id: "mock-id" }));
export const deleteDoc = jest.fn();
