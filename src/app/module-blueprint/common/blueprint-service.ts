import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Template } from './template/template';
import { AuthenticationService } from '../components/user-auth/authentification-service';

@Injectable()
export class BlueprintService
{
  constructor(private http: HttpClient, private authService: AuthenticationService) {}

  saveBlueprint(blueprint: Template, overwrite: boolean)
  {
    console.log('saveblueprint')
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