import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SaveInfo } from '../../../common/save-info';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BlueprintService } from '../../../services/blueprint-service';
import { Blueprint } from '../../../common/blueprint/blueprint';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../../services/authentification-service';
import { BlueprintNameValidationDirective } from 'src/app/module-blueprint/directives/blueprint-name-validation.directive';
import { Display } from 'src/app/module-blueprint/common/overlay-type';

@Component({
  selector: 'app-component-save-dialog',
  templateUrl: './component-save-dialog.component.html',
  styleUrls: ['./component-save-dialog.component.css']
})
export class ComponentSaveDialogComponent implements OnInit {

  visible: boolean = false;

  @Output() onSave = new EventEmitter();
  @Output() onUpdateThumbnail = new EventEmitter();
  
  saveBlueprintForm = new FormGroup({
    thumbnailType: new FormControl('Color', [Validators.required]),
    name: new FormControl('', [Validators.required, BlueprintNameValidationDirective.validateBlueprintName]),
    
  });

  get f() { return this.saveBlueprintForm.controls; }
  get icon() { return this.working || this.blueprintService.thumbnail == null ? 'pi pi-spin pi-spinner' : ''; }
  get saveLabel() { return this.blueprintService.thumbnail == null ? 'Generating thumbnail' : 'Save' }

  working: boolean = false;
  thumbnailReady: boolean = false;
  overwrite: boolean = false;

  constructor(
    public blueprintService: BlueprintService, 
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

  handleSaveError()
  {
    this.hideDialog();
    this.messageService.add({severity:'error', summary:'Error saving blueprint'});
    this.working = false;
  }


  intervalId: number;
  showDialog()
  {
    this.reset();
    this.visible = true;

    this.saveBlueprintForm.patchValue({thumbnailType: 'Color'});
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

  changeThumbnail() {
    console.log(this.saveBlueprintForm.value.thumbnailType)
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

    console.log(this.saveBlueprintForm.value);
    this.blueprintService.name = this.saveBlueprintForm.getRawValue().name; // Use get raw Value because it can be disabled
    this.blueprintService.thumbnailStyle = this.saveBlueprintForm.value.thumbnailType == 'Color' ? Display.solid : Display.blueprint;
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
