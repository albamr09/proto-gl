export const loadData = async (filePath: string) => {
  return fetch(filePath).then((res) => res.json());
};

export const loadDataFromFolder = async (
  folderPath: string,
  size: number,
  cb: (data: any) => void
) => {
  Array.from({ length: size }, (_, i) => i).forEach((i) => {
    fetch(`${folderPath}/part${i + 1}.json`)
      .then((res) => res.json())
      .then(cb);
  });
};
