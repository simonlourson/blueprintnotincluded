declare var PIXI: any;

export class ImageSource
{
    imageId: string;
    imageUrl: string;

    constructor(imageId: string, imageUrl: string)
    {
        this.imageId = imageId;
        this.imageUrl = imageUrl;
    }

    // PIXI stuff
    private static imageSourcesMapPixi: Map<string, ImageSource>;
    private baseTexture: PIXI.BaseTexture ;
    public static InitPixi()
    {
      if (ImageSource.imageSourcesMapPixi == null)
        ImageSource.imageSourcesMapPixi = new Map<string, ImageSource>();
    }

    public static AddImagePixi(imageId: string, imageUrl: string)
    {
      let newImageSource = new ImageSource(imageId, imageUrl);
      ImageSource.imageSourcesMapPixi.set(newImageSource.imageId, newImageSource);
    }

    public static getBaseTexture(imageId: string): PIXI.BaseTexture
    {
      let imageSource: ImageSource = ImageSource.imageSourcesMapPixi.get(imageId);

      if (imageSource == null) return null;

      if (imageSource.baseTexture == null)
        imageSource.baseTexture = new PIXI.BaseTexture(imageSource.imageUrl);
     
      return imageSource.baseTexture;
    }
}