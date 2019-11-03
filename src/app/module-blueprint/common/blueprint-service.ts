import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from './template/template';
import { AuthenticationService } from '../components/user-auth/authentification-service';
import { map } from 'rxjs/operators';

@Injectable()
export class BlueprintService
{
  constructor(private http: HttpClient, private authService: AuthenticationService) {}

  getBlueprint(id: string)
  {
    const request = this.http.get(`/api/getblueprint/${id}`).pipe(
      map((response: any) => {
        if (response.data) {
          let blueprint = new Template();
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

    return this.http.post('/api/uploadblueprint', body, { headers: { Authorization: `Bearer ${this.authService.getToken()}` }});
  }
}

export class SaveBlueprintMessage
{
  overwrite: boolean;
  name: string;
  tags?: string[];
  blueprint: Template;
}