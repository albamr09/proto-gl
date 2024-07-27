export const loadData = async (filePath: string) => {
  return fetch(filePath).then((res) => res.json());
};
