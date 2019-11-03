import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from './template/template';
import { AuthenticationService } from '../components/user-auth/authentification-service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BlueprintService
{
  static baseUrl: string = 'blueprintnotincluded.com/';

  // TODO observable when modified, to be subscribed by the canvas
  blueprint: Template;

  constructor(private http: HttpClient, private authService: AuthenticationService) {
    this.blueprint = new Template();
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