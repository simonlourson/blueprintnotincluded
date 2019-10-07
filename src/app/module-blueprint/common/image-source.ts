import { ChangeDetectorRef } from "@angular/core";
import { Vector2 } from "./vector2";
import { BlueprintParams } from "./params";

export class ImageSource
{
    imageId: string;
    imageUrl: string;
    requested: boolean;
    loaded: boolean;

    isColorAtlas: boolean;
    imageIdSource: string;

    constructor(imageId: string, imageUrl: string)
    {
        this.imageId = imageId;
        this.imageUrl = imageUrl;
        this.requested = false;
    }

    // private map to check the requested status of images
    private static imageSourcesMap: Map<string, ImageSource>;

    // public array for img ngFor
    public static imageSourcesLoaded: boolean = false;
    public static imageSources: ImageSource[];
    public static canvasSources: ImageSource[];

    private static cd: ChangeDetectorRef;
    public static Init(cd: ChangeDetectorRef)
    {
      ImageSource.cd = cd;
      ImageSource.imageSourcesMap = new Map<string, ImageSource>();

      /*
        let promise = new Promise((resolve, reject) => {
            ImageSource.cd = cd;
            ImageSource.imageSourcesMap = new Map<string, ImageSource>();

            //fetch("/assets/database/imageSource.json")
            fetch(BlueprintParams.apiUrl+'imageSources')
            .then(response => { return response.json() })
            .then(json => {
                
                let imageSourceTemp: ImageSource[] = json;
                

                for (let imageSource of imageSourceTemp) {
                    let alreadyRequested = ImageSource.imageSourcesMap.get(imageSource.imageId) != null && ImageSource.imageSourcesMap.get(imageSource.imageId).requested;
                    
                    let newImageSource = new ImageSource(imageSource.imageId, imageSource.imageUrl);
                    newImageSource.requested = alreadyRequested;

                    ImageSource.imageSourcesMap.set(newImageSource.imageId, newImageSource);

                }

                ImageSource.imageSourcesLoaded = true;
            })
            .catch(error => {
                ImageSource.imageSourcesLoaded = true;
                reject(error);
            })
        });

        return promise;
        */
    }

    public static AddImage(imageId: string, imageUrl: string)
    {
      let alreadyRequested = ImageSource.imageSourcesMap.get(imageId) != null && ImageSource.imageSourcesMap.get(imageId).requested;

      let newImageSource = new ImageSource(imageId, imageUrl);
      newImageSource.requested = alreadyRequested;

      ImageSource.imageSourcesMap.set(newImageSource.imageId, newImageSource);
    }

    public static FinishAddImage()
    {
      ImageSource.imageSourcesLoaded = true;
    }

    public static getImageUrl(imageId: string): string
    {
        let imageSource = ImageSource.imageSourcesMap.get(imageId);
        return imageSource.imageUrl;
    }

    public static getImage(imageId: string) : HTMLImageElement | HTMLCanvasElement
    {
        if (imageId == null) return null;

        // First we try to see if the imageSource is already loaded
        let imageSource = ImageSource.imageSourcesMap.get(imageId);

        // if the imageSource is not in the imageSource json file, or if the file is not loaded, we load a placeholder instead
        if (imageSource == null)
        {
            imageSource = new ImageSource(imageId, null);

            // We check if the image should be a color atlas
            if (imageId.includes("_coloratlas"))
            {
                let imageIdSource = imageId.replace('_coloratlas_a', '').replace('_coloratlas_r', '').replace('_coloratlas_g', '').replace('_coloratlas_b', '');
                imageSource.imageIdSource = imageIdSource;
                imageSource.isColorAtlas = true;
            }

            ImageSource.imageSourcesMap.set(imageSource.imageId, imageSource);

            
        }

        // if the image has not been requested yet, we request it by regenerating the array used by angular
        if (!imageSource.requested)
        {
            imageSource.requested = true;
            ImageSource.genImageSources();

            if (imageSource.isColorAtlas) ImageSource.createColorAtlas(imageSource);
        }
        // if the image has been requested, but is not yet loaded, we return null
        else if (!imageSource.loaded)
        {
            return null;
        }
        else
        {
            let returnValue = window.document.getElementById(imageId) as HTMLImageElement | HTMLCanvasElement;

            if (returnValue == null) throw 'Something weird has happened in getImage';

            return returnValue;
        }
    }

    public static imageLoaded(event: any)
    {
        let imageSourceJustLoaded = ImageSource.imageSourcesMap.get(event.target.id);
        if (imageSourceJustLoaded != null) imageSourceJustLoaded.loaded = true;
    }

    private static genImageSources()
    {
        if (ImageSource.imageSourcesLoaded) 
        {
            ImageSource.imageSources = Array.from(ImageSource.imageSourcesMap.values()).filter(i => i.requested && i.imageUrl != null && !i.isColorAtlas);
            ImageSource.canvasSources = Array.from(ImageSource.imageSourcesMap.values()).filter(i => i.requested && i.isColorAtlas);
            ImageSource.cd.detectChanges();
        }
        else ImageSource.imageSources = [];
    }

    private static createColorAtlas(imageSource: ImageSource)
    {
        ImageSource.genImageSources();
        let image = ImageSource.getImage(imageSource.imageIdSource);
        let buffer = document.getElementById(imageSource.imageId) as HTMLCanvasElement;
        buffer.width = image.width;
        buffer.height = image.height;
        let bx = buffer.getContext('2d');

        let color = '#000000'
        if (imageSource.imageId.includes('_coloratlas_r')) color = '#FF0000'
        if (imageSource.imageId.includes('_coloratlas_g')) color = '#00FF00'
        if (imageSource.imageId.includes('_coloratlas_b')) color = '#0000FF'

        bx.fillStyle = color
        bx.fillRect(0,0,image.width,image.height);
        bx.globalCompositeOperation = 'destination-atop';
        bx.drawImage(image,0,0);



        

        imageSource.loaded = true;
        
    }
}