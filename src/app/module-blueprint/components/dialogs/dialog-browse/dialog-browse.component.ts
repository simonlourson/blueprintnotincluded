import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener, AfterContentInit, ElementRef } from '@angular/core';
import { BlueprintListItem, BlueprintListResponse } from 'src/app/module-blueprint/services/messages/blueprint-list-response';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { Dialog } from 'primeng/dialog';
import { CameraService, IObsAnimationChanged } from 'src/app/module-blueprint/services/camera-service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/module-blueprint/services/authentification-service';

@Component({
  selector: 'app-dialog-browse',
  templateUrl: './dialog-browse.component.html',
  styleUrls: ['./dialog-browse.component.css']
})
export class DialogBrowseComponent implements OnInit {

  @ViewChild('browseDialog', {static: true}) browseDialog: Dialog
  @ViewChild('scrollable', {static: true}) scrollable: ElementRef

  visible: boolean = false;
  blueprintListItems: BlueprintListItem[];

  working: boolean;
  noMoreBlueprints: boolean;
  oldestDate: Date;
  filterUser: boolean;
  filterUserId: string;
  filterUserName: string;
  remaining: number;

  getDuplicates: boolean;
  duplicateChange() {

  }

  filterUserChange() {
    if (this.filterUser == false) {
      this.reset();
      this.getBlueprints();
    }
  }

  get disabled() { return this.working; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  loadingBlueprintItem: BlueprintListItem;

  constructor(
    private blueprintService: BlueprintService, 
    public authService: AuthenticationService,
    public datepipe: DatePipe) { 

    let tempDate = new Date();
    this.loadingBlueprintItem = {
      id: null,
      name: 'Loading...',
      ownerId: '',
      ownerName: 'Loading...',
      createdAt: tempDate,
      modifiedAt: tempDate,
      thumbnail: 'svg',
      tags: null,
      likedByMe: false,
      nbLikes: 0
    };

    
  }

  ngOnInit() {
    this.browseDialog.onShow.subscribe({
      next: this.handleOnShow.bind(this)
    });

    this.reset();
  }
  
  filterOwner(id: string, name: string) {
    this.reset();
    this.filterUser = true;
    this.filterUserId = id;
    this.filterUserName = name;
    this.getBlueprints();
  }

  getBlueprints() {
    this.blueprintService.getBlueprints(this.oldestDate, this.filterUserId, this.getDuplicates).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });
  }

  reset() {
    
    this.noMoreBlueprints = false;
    this.oldestDate = new Date();
    this.filterUserId = null;
    this.filterUserName = null;
    
    this.removeAll();
  }

  removeAll() {
    this.working = true;
    this.scrollable.nativeElement.scrollTop = 0;
    this.remaining = 6;
    this.blueprintListItems = [];
    this.appendTemp();
  }

  appendTemp() {
    for (let i = 0; i < this.remaining; i++) this.blueprintListItems.push(this.loadingBlueprintItem);
  }

  openBlueprint(item: BlueprintListItem) {
    this.hideDialog();
    this.blueprintService.openBlueprintFromId(item.id)
  }

  hideDialog() {
    this.visible = false;
  }

  showDialog()
  {
    this.reset();
    this.getBlueprints();
    this.visible = true;

  }

  handleOnShow() {
    this.scrollable.nativeElement.addEventListener('scroll', this.scroll.bind(this));
  }

  scroll(e: Event) {
    let scrollTop: number = this.scrollable.nativeElement.scrollTop;
    let scrollMax: number = this.scrollable.nativeElement.scrollHeight - this.scrollable.nativeElement.clientHeight;
    //console.log('scroll')
    //console.log({scrollTop: scrollTop, scrollMax: scrollMax});
    if (!this.noMoreBlueprints && !this.working && scrollTop >  scrollMax - 5) {
      this.loadMoreBlueprints();
    }
  }

  handleGetBlueprints(blueprintListResponse: BlueprintListResponse) {
    this.working = false;
    this.oldestDate = new Date(blueprintListResponse.oldest);
    this.remaining = blueprintListResponse.remaining;

    if (this.remaining == 0) this.noMoreBlueprints = true;
      
    this.blueprintListItems = this.blueprintListItems.filter((i) => { return i != this.loadingBlueprintItem; });

    blueprintListResponse.blueprints.map((item) => { this.blueprintListItems.push(item); });
    
  }
  
  loadMoreBlueprints() {
    this.working = true;
    this.appendTemp();
    this.getBlueprints();
  }
}
