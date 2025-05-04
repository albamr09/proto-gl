class TextureImage {
  private source?: string | null = null;
  private data?: HTMLImageElement;

  constructor({ source, data }: { source?: string; data?: HTMLImageElement }) {
    this.source = source;
    this.data = data;
  }

  public getSource() {
    return this.source;
  }

  public setSource(source: string) {
    this.source = source;
  }

  public getImage() {
    return this.data;
  }

  public setImage(data: HTMLImageElement) {
    this.data = data;
  }

  public loadImage() {
    if (!this.source) {
      throw new Error("There is no source on this texture");
    }
    return this.loadHTMLImage(this.source);
  }

  private loadHTMLImage(source: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.data = img;
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load imageData from source: ${source}`));
      };

      img.src = source;
    });
  }

  public hasData() {
    return !!this.data;
  }
}

export default TextureImage;
