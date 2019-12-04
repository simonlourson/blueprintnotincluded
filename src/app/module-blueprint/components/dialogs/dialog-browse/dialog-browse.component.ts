import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener, AfterContentInit } from '@angular/core';
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
export class DialogBrowseComponent implements OnInit, AfterContentInit {

  @ViewChild('browseDialog', {static: true}) browseDialog: Dialog

  visible: boolean = false;
  blueprintListItems: BlueprintListItem[];

  working: boolean;
  noMoreBlueprints: boolean;
  oldestDate: Date;
  remaining: number;

  get disabled() { return this.working; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  loadingBlueprintItem: BlueprintListItem;

  constructor(
    private blueprintService: BlueprintService, 
    private authService: AuthenticationService,
    public datepipe: DatePipe) { 

    let tempDate = new Date();
    this.loadingBlueprintItem = {
      id: null,
      name: 'Loading...',
      ownerName: 'Loading...',
      createdAt: tempDate,
      modifiedAt: tempDate,
      thumbnail: 'svg',
      tags: null,
      likedByMe: false,
      nbLikes: 0
    };

    this.reset();
  }

  ngOnInit() {
    this.browseDialog.onShow.subscribe({
      next: this.handleOnShow.bind(this)
    });
  }

  ngAfterContentInit(): void {
    //console.log(this.browseDialog.contentViewChild.nativeElement);
  }

  reset() {
    this.working = true;
    this.noMoreBlueprints = false;
    this.oldestDate = new Date();
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
    this.blueprintService.getBlueprints(new Date()).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });
    this.visible = true;

    
    //console.log(this.browseDialog.contentViewChild.nativeElement);
    
    //this.browseDialog.contentViewChild.nativeElement.addEventListener('scroll', function(e) {
    //  console.log('scroll');
    //});
  }

  handleOnShow() {
    this.browseDialog.contentViewChild.nativeElement.addEventListener('scroll', this.scroll.bind(this));
  }

  scroll(e: Event) {
    let scrollTop: number = this.browseDialog.contentViewChild.nativeElement.scrollTop;
    let scrollMax: number = this.browseDialog.contentViewChild.nativeElement.scrollHeight - this.browseDialog.contentViewChild.nativeElement.clientHeight;
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

    // TODO remove duplicates
    blueprintListResponse.blueprints.map((item) => { this.blueprintListItems.push(item); });
    
    //this.recenter();
  }

  
  loadMoreBlueprints() {

    // Get the oldest date received
    // TODO oldest date and isLast in response
    this.working = true;
    this.appendTemp();

    this.blueprintService.getBlueprints(this.oldestDate).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });

  }
}
