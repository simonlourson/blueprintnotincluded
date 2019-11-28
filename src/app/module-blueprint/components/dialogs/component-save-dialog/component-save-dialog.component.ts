import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SaveInfo } from '../../../common/save-info';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlueprintService } from '../../../services/blueprint-service';
import { Blueprint } from '../../../common/blueprint/blueprint';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../../services/authentification-service';

@Component({
  selector: 'app-component-save-dialog',
  templateUrl: './component-save-dialog.component.html',
  styleUrls: ['./component-save-dialog.component.css']
})
export class ComponentSaveDialogComponent implements OnInit {

  visible: boolean = false;

  @Output() onSave = new EventEmitter();
  
  saveBlueprintForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  get f() { return this.saveBlueprintForm.controls; }
  get icon() { return this.working || this.blueprintService.thumbnail == null ? 'pi pi-spin pi-spinner' : ''; }
  get saveLabel() { return this.blueprintService.thumbnail == null ? 'Generating thumbnail' : 'Save' }

  working: boolean = false;
  thumbnailReady: boolean = false;
  overwrite: boolean = false;

  constructor(
    private blueprintService: BlueprintService, 
    private messageService: MessageService,
    //TODO should not be public
    public authService: AuthenticationService) { }

  ngOnInit() {
  }

  onSubmit()
  {
    this.working = true;

    this.blueprintService.name = this.saveBlueprintForm.value.name;
    this.blueprintService.saveBlueprint(false).subscribe({
      next: this.handleSaveNext.bind(this),
      error: this.handleSaveError.bind(this)
    });
  }

  // TODO this is ugly, use pipe map instead
  public id: string;
  handleSaveNext(response: any)
  {
    
    if (response.overwrite) 
    {
      this.overwrite = true;
      this.saveBlueprintForm.controls.name.disable();
      this.working = false;
    }
    else
    {
      this.hideDialog();

      // TODO move this to the service ?
      let summary: string = this.blueprintService.name + ' saved';
      let detail: string = '';
  
      this.messageService.add({severity:'success', summary:summary , detail:detail});
      this.working = false;
    }


  }

  // TODO in browser also
  handleSaveError()
  {
    this.working = false;
  }


  intervalId: number;
  showDialog()
  {
    this.reset();
    this.visible = true;

    if (this.blueprintService.name != null && this.blueprintService.name != '') this.saveBlueprintForm.patchValue({name: this.blueprintService.name});
  }

  tryClearInterval() {
    if (this.intervalId != null) window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  updateThumbnailReady() {
    //console.log('updateThumbnailReady');
    this.thumbnailReady = this.blueprintService.thumbnail != null;

    if (this.thumbnailReady) this.tryClearInterval();
  }

  reset()
  {
    this.working = false;
    this.thumbnailReady = false;
    this.overwrite = false;
    this.saveBlueprintForm.controls.name.enable();
    this.saveBlueprintForm.reset();

    // We add an interval to check the thumbnail status, because it is generated outside angular
    this.tryClearInterval();
    this.intervalId = window.setInterval(this.updateThumbnailReady.bind(this), 500);
  }

  doNotOverwrite()
  {
    this.overwrite = false;
    this.saveBlueprintForm.controls.name.enable();
  }

  doOverwrite()
  {
    this.working = true;

    this.blueprintService.name = this.saveBlueprintForm.value.name;
    this.blueprintService.saveBlueprint(true).subscribe({
      next: this.handleSaveNext.bind(this),
      error: this.handleSaveError.bind(this)
    });
  }

  hideDialog()
  {
    this.visible = false;
  }

}
