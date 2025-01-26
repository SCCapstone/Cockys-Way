const fetchInfo = jest.fn((subject, semester) => {
  if (subject === "CSCE" && semester === 202408) {
    return { data: [{ id: 1, name: "Testing the name" }] };
  }
  return { data: [] };
});

export default fetchInfo;
