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

export const loadAllDataFromFolder = (folderPath: string, size: number) => {
  return Array.from({ length: size }, (_, i) => i).map(async (i) => {
    return fetch(`${folderPath}/part${i + 1}.json`).then((res) => res.json());
  });
};

export const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    try {
      const imageInput = new Image();
      imageInput.src = src;
      imageInput.onload = () => {
        resolve(imageInput);
      };
    } catch (e) {
      reject(e);
    }
  });
};
