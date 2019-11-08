import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from '../common/template/template';
import { AuthenticationService } from './authentification-service';
import { map } from 'rxjs/operators';
import { IObsOverlayChanged, CameraService } from './camera-service';
import { Overlay } from '../common/overlay-type';

@Injectable({ providedIn: 'root' })
export class BlueprintService implements IObsOverlayChanged
{
  static baseUrl: string = 'blueprintnotincluded.com/';

  // TODO observable when modified, to be subscribed by the canvas
  blueprint: Template;

  constructor(private http: HttpClient, private authService: AuthenticationService, private cameraService: CameraService) {
    this.blueprint = new Template();

    this.cameraService.subscribeOverlayChange(this);
  }

  overlayChanged(newOverlay: Overlay) {
    this.blueprint.prepareOverlayInfo(newOverlay);
  }

  getBlueprint(id: string)
  {
    const request = this.http.get(`/api/getblueprint/${id}`).pipe(
      map((response: any) => {
        if (response.data) {
          let blueprint = new Template();

          blueprint.id = response._id;
          blueprint.importFromCloud(response.data);
          return blueprint;
        }
      })
    );

    return request;
  }

  saveBlueprint(blueprint: Template, overwrite: boolean)
  {
    let saveBlueprint = blueprint.cloneForExport();

    let body = new SaveBlueprintMessage();
    body.overwrite = overwrite;
    body.name = saveBlueprint.name;
    body.blueprint = saveBlueprint;

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
  blueprint: Template;
}