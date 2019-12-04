import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Blueprint } from '../common/blueprint/blueprint';
import { AuthenticationService } from './authentification-service';
import { map } from 'rxjs/operators';
import { IObsOverlayChanged, CameraService } from './camera-service';
import { Overlay } from '../common/overlay-type';
import { BlueprintListItem, BlueprintLike } from './messages/blueprint-list-response';
import { ComponentMenuComponent } from '../components/component-menu/component-menu.component';
import { OniTemplate } from '../common/blueprint/io/oni/oni-template';
import * as yaml from 'node_modules/js-yaml/lib/js-yaml';
import { BniBlueprint } from '../common/blueprint/io/bni/bni-blueprint';
import { BlueprintResponse } from './messages/blueprint-response';

@Injectable({ providedIn: 'root' })
export class BlueprintService implements IObsOverlayChanged
{
  //static baseUrl: string = 'blueprintnotincluded.com/';
  static baseUrl: string = 'https://blueprintnotincluded.com/';

  id: string;
  name: string;
  // TODO observable when modified, to be subscribed by the canvas
  // TODO not sure getter setters are useful
  blueprint_: Blueprint;
  get blueprint() { return this.blueprint_; }
  set blueprint(value: Blueprint) { 
    this.blueprint_ = value;
    //this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(this.blueprint_); }) 
  }
  thumbnail: string;

  get savedBlueprint() { return this.id != null; }

  static blueprintService: BlueprintService;

  constructor(private http: HttpClient, private authService: AuthenticationService, private cameraService: CameraService) {
    this.blueprint = new Blueprint();


    this.observersBlueprintChanged = [];

    this.cameraService.subscribeOverlayChange(this);


    BlueprintService.blueprintService = this;

    this.reset();
  }

  overlayChanged(newOverlay: Overlay) {
    this.blueprint.prepareOverlayInfo(newOverlay);
  }

  observersBlueprintChanged: IObsBlueprintChanged[];
  subscribeBlueprintChanged(observer: IObsBlueprintChanged) {
    this.observersBlueprintChanged.push(observer);
  }

  openBlueprintFromUpload(fileType: BlueprintFileType, fileList: FileList) {
    if (fileList.length > 0)
    {
      if (fileType == BlueprintFileType.YAML) this.openYamlBlueprint(fileList[0]);
      else if (fileType == BlueprintFileType.JSON) this.openJsonBlueprint(fileList[0]);
      else if (fileType == BlueprintFileType.BSON) this.openBsonBlueprint(fileList[0]);
    }
  }

  private openYamlBlueprint(file: File) {
    let reader = new FileReader();
    reader.onloadend = () => { this.loadYamlBlueprint(reader.result as string); };
    reader.readAsText(file);
  }

  private loadYamlBlueprint(yamlString: string) {
    let templateYaml: OniTemplate = yaml.safeLoad(yamlString);

    let newBlueprint = new Blueprint();
    this.name = templateYaml.name;
    newBlueprint.importOniTemplate(templateYaml);

    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(newBlueprint); })
  }

  private openJsonBlueprint(file: File) {
    let reader = new FileReader();
    reader.onloadend = () => { this.loadJsonBlueprint(reader.result as string); };
    reader.readAsText(file);
  }

  private loadJsonBlueprint(template: string)
  {
    let templateJson: BniBlueprint = JSON.parse(template);

    let newBlueprint = new Blueprint();
    this.name = templateJson.friendlyname;
    newBlueprint.importBniBlueprint(templateJson);
    
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(newBlueprint); })
  }

  private openBsonBlueprint(file: File) {
    let reader = new FileReader();
    reader.onloadend = () => { this.loadBsonBlueprint(reader.result as ArrayBuffer); };
    reader.readAsArrayBuffer(file);
  }

  private loadBsonBlueprint(template: ArrayBuffer)
  {
    let newBlueprint = new Blueprint();
    newBlueprint.importFromBinary(template);
    
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(newBlueprint); })
  }

  newBlueprint() {
    this.name = 'new blueprint';
    this.reset();
    let newBlueprint = new Blueprint();
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(newBlueprint); })
  }

  reset() {
    this.id = null;
    this.likedByMe = false;
  }  

  // TODO return observable here so we can close the browse window on success?
  openBlueprintFromId(id: string) {
    this.getBlueprint(id).subscribe({
      next: this.handleGetBlueprint.bind(this),
      error: this.handleGetBlueprintError.bind(this)
    });
  }

  handleGetBlueprint(blueprint: Blueprint)
  {
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(blueprint); })
  }

  handleGetBlueprintError(error: any)
  {
    // TODO toast here
    console.log(error)
  }

  getBlueprint(id: string)
  {
    const request = this.http.get(`/api/getblueprint/${id}`).pipe(
      map((response: BlueprintResponse) => {
        if (response.data) {
          let blueprint = new Blueprint();

          this.id = response.id;
          this.name = response.name;
          this.likedByMe = response.likedByMe;
          this.nbLikes = response.nbLikes;
          blueprint.importFromCloud(response.data);
          return blueprint;
        }
      })
    );

    return request;
  }
 
  getBlueprints(olderThan: Date) { 
    let parameterOlderThan = 'olderthan='+olderThan.getTime().toString();
    let parameterUserId = 'userId='+ (this.authService.isLoggedIn() ? this.authService.getUserDetails()._id : '')
    const request = this.http.get('/api/getblueprints?'+parameterOlderThan+'&'+parameterUserId).pipe(
      map((response: any) => {
        let blueprintListItems = response as BlueprintListItem[];
        return blueprintListItems;
      })
    );

    return request;
  }

  saveBlueprint(overwrite: boolean)
  {
    let saveBlueprint = this.blueprint.cloneForExport();

    let body = new SaveBlueprintMessage();
    body.overwrite = overwrite;
    body.name = this.name;
    body.blueprint = saveBlueprint;
    body.thumbnail = this.thumbnail;
    const request = this.http.post('/api/uploadblueprint', body, { headers: { Authorization: `Bearer ${this.authService.getToken()}` }}).pipe(
      map((response: any) => {
        if (response.id) { this.id = response.id; }
        return response;
      })
    );

    return request;
  }

  nbLikes: number;
  likedByMe: boolean;
  likeBlueprint(blueprintId: string, like: boolean) {
    this.likedByMe = !this.likedByMe;
    let body: BlueprintLike = {
      blueprintId: blueprintId,
      like: like
    }

    // We don't care about the response
    this.http.post('/api/likeblueprint', body, { headers: { Authorization: `Bearer ${this.authService.getToken()}` }}).subscribe();
  }
}

export class SaveBlueprintMessage
{
  overwrite: boolean;
  name: string;
  tags?: string[];
  blueprint: Blueprint;
  thumbnail: string;
}

export enum BlueprintFileType {
  YAML,
  JSON,
  BSON
}

export interface IObsBlueprintChanged {
  blueprintChanged(blueprint: Blueprint);
}

export interface ExportImageOptions {
  gridLines: boolean;
  selectedOverlays: Overlay[];
  pixelsPerTile: number;
}