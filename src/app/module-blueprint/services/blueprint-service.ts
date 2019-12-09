import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Blueprint, IObsBlueprintChange } from '../common/blueprint/blueprint';
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
import { MdbBlueprint } from '../common/blueprint/io/mdb/mdb-blueprint';
import { BlueprintItem } from '../common/blueprint/blueprint-item';

@Injectable({ providedIn: 'root' })
export class BlueprintService implements IObsOverlayChanged, IObsBlueprintChange
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

    // Undo / Redo stuff
    this.blueprint.subscribeBlueprintChanged(this)
    this.resetUndoStates();

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

      this.resetUndoStates();
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
    newBlueprint.importFromOni(templateYaml);

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
    newBlueprint.importFromBni(templateJson);
    
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
    this.resetUndoStates();
    // TODO firing the observable and then restting the states is duplicated. fix this
  }

  reset() {
    this.id = null;
    this.likedByMe = false;
  }  

  suppressChanges: boolean;
  undoStates: MdbBlueprint[];
  undoIndex: number;
  undo() {
    let tempUndoIndex = this.undoIndex - 1;

    if (tempUndoIndex < 0 || tempUndoIndex >= this.undoStates.length) return;

    this.undoIndex = tempUndoIndex;
    this.reloadUndoIndex();
  }

  redo() {
    let tempUndoIndex = this.undoIndex + 1;

    if (tempUndoIndex >= this.undoStates.length) return;

    this.undoIndex = tempUndoIndex;
    this.reloadUndoIndex();
  }

  reloadUndoIndex() {
    let newBlueprint = new Blueprint();
    newBlueprint.importFromMdb(this.undoStates[this.undoIndex]);

    this.suppressChanges = true;
    this.blueprint.destroyAndCopyItems(newBlueprint);
    this.blueprint.refreshOverlayInfo();
    this.suppressChanges = false;
  }

  resetUndoStates() {
    this.suppressChanges = false;
    this.undoStates = [];
    this.undoIndex = 0;

    this.blueprintChanged();
  }

  itemDestroyed() {}
  itemAdded(blueprintItem: BlueprintItem) {}
  blueprintChanged() {

    // We don't want to add a state if the changes come from the undo / redo action
    if (this.suppressChanges) return;

    // If we are in the middle of the states, doing anythings scraps the further redos
    if (this.undoIndex < this.undoStates.length - 1) this.undoStates.splice(this.undoIndex + 1);

    
    let newState = this.blueprint.toMdbBlueprint();
    /*if (this.undoStates.length > 0) {
      let oldState = this.undoStates[this.undoStates.length - 1];
      let oldHash = this.hashMdb(oldState);
      let newHash = this.hashMdb(newState);
      if (oldHash != newHash) this.undoStates.push(newState);
    }
    else */this.undoStates.push(newState);

    
    

    while (this.undoStates.length > 50) this.undoStates.splice(0, 1);

    this.undoIndex = this.undoStates.length - 1;
  }

  hashMdb(mdb: MdbBlueprint) {
    let s = JSON.stringify(mdb);
    var hash = 0, i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
      chr   = s.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
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
    this.observersBlueprintChanged.map((observer) => { observer.blueprintChanged(blueprint); });
    this.resetUndoStates();
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
          blueprint.importFromMdb(response.data);
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
    let saveBlueprint = this.blueprint.toMdbBlueprint();

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
  blueprint: MdbBlueprint;
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