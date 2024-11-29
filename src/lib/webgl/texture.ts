class Texture {
  private source: string | null = null;
  private imageData!: HTMLImageElement | Uint8Array;

  constructor(
    source: string | Uint8Array | HTMLImageElement,
    type?: "image" | "bytes"
  ) {
    if (typeof source === "string") {
      this.source = source;
      this.loadImage(source);
      if (!type || type === "image") {
        this.loadImage(source);
      } else if (type === "bytes") {
        this.loadPixelArray(source);
      } else {
        throw new Error(`Unsupported texture type: ${type}`);
      }
    } else if (source instanceof Uint8Array) {
      this.imageData = source;
    } else if (source instanceof HTMLImageElement) {
      this.imageData = source;
    } else {
      throw new Error("Unsupported texture source type.");
    }
  }

  private loadImage(source: string) {
    const img = new Image();
    img.src = source;
    img.onload = () => {
      this.imageData = img;
    };
    img.onerror = () => {
      throw new Error(`Failed to load imageData from source: ${source}`);
    };
  }

  private async loadPixelArray(source: string): Promise<void> {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch pixel data from source: ${source}`);
      }
      const buffer = await response.arrayBuffer();
      this.imageData = new Uint8Array(buffer);
    } catch (error) {
      throw new Error(
        `Failed to fetch pixel data from source: ${source}, ${error}`
      );
    }
  }

  public getSource() {
    return this.source;
  }

  public getImage() {
    return this.imageData;
  }
}

export default Texture;
