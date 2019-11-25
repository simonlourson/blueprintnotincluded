import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Blueprint } from '../common/blueprint/blueprint';
import { AuthenticationService } from './authentification-service';
import { map } from 'rxjs/operators';
import { IObsOverlayChanged, CameraService } from './camera-service';
import { Overlay } from '../common/overlay-type';
import { BlueprintListItem } from './blueprint-list-response';
import { ComponentMenuComponent } from '../components/component-menu/component-menu.component';
import { OniTemplate } from '../common/blueprint/io/oni/oni-template';
import * as yaml from 'node_modules/js-yaml/lib/js-yaml';
import { BniBlueprint } from '../common/blueprint/io/bni/bni-blueprint';

@Injectable({ providedIn: 'root' })
export class BlueprintService implements IObsOverlayChanged
{
  static baseUrl: string = 'blueprintnotincluded.com/';

  // TODO observable when modified, to be subscribed by the canvas
  // TODO not sure getter setters are useful
  blueprint_: Blueprint;
  get blueprint() { return this.blueprint_; }
  set blueprint(value: Blueprint) { 
    this.blueprint_ = value;
    //this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(this.blueprint_); }) 
  }
  thumbnail: string;

  static blueprintService: BlueprintService;

  constructor(private http: HttpClient, private authService: AuthenticationService, private cameraService: CameraService) {
    this.blueprint = new Blueprint();


    this.observersBlueprintChanged = [];

    this.cameraService.subscribeOverlayChange(this);


    BlueprintService.blueprintService = this;
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
    let newBlueprint = new Blueprint();
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(newBlueprint); })
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
      map((response: any) => {
        if (response.data) {
          let blueprint = new Blueprint();

          blueprint.id = response._id;
          blueprint.importFromCloud(response.data);
          return blueprint;
        }
      })
    );

    return request;
  }

  getBlueprints(olderThan: Date) { 
    const request = this.http.get('/api/getblueprints?olderthan='+olderThan.getTime().toString()).pipe(
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
    body.name = saveBlueprint.name;
    body.blueprint = saveBlueprint;
    body.thumbnail = this.thumbnail;
    const request = this.http.post('/api/uploadblueprint', body, { headers: { Authorization: `Bearer ${this.authService.getToken()}` }}).pipe(
      map((response: any) => {
        if (response.id) { this.blueprint.id = response.id; }
        return response;
      })
    );

    return request;
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