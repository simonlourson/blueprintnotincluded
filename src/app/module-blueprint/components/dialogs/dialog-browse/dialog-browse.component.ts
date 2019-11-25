import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener, AfterContentInit } from '@angular/core';
import { BlueprintListItem, BlueprintListResponse } from 'src/app/module-blueprint/services/blueprint-list-response';
import { BlueprintService } from 'src/app/module-blueprint/services/blueprint-service';
import { Dialog } from 'primeng/dialog';
import { CameraService, IObsAnimationChanged } from 'src/app/module-blueprint/services/camera-service';
import { DatePipe } from '@angular/common';

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
  firstLoading: boolean;

  get disabled() { return this.working; }
  get icon() { return this.working ? 'pi pi-spin pi-spinner' : ''; }

  loadingBlueprintItem: BlueprintListItem;

  constructor(
    private blueprintService: BlueprintService, 
    public datepipe: DatePipe) { 

    let tempDate = new Date();
    this.loadingBlueprintItem = {
      id: null,
      name: 'Loading...',
      ownerName: 'Loading...',
      createdAt: tempDate,
      modifiedAt: tempDate,
      thumbnail: 'svg',
      tags: null
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
    this.firstLoading = true;
    this.working = true;
    this.noMoreBlueprints = false;

    this.blueprintListItems = [];
    this.appendTemp();
  }

  appendTemp() {
    for (let i = 0; i < 6; i++) this.blueprintListItems.push(this.loadingBlueprintItem);
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
    //console.log('scroll')
    let scrollTop: number = this.browseDialog.contentViewChild.nativeElement.scrollTop;
    let scrollMax: number = this.browseDialog.contentViewChild.nativeElement.scrollHeight - this.browseDialog.contentViewChild.nativeElement.clientHeight;
    //console.log({scrollTop: scrollTop, scrollMax: scrollMax});
    if (!this.noMoreBlueprints && !this.working && scrollTop >  scrollMax - 5) {
      this.loadMoreBlueprints();
    }
  }

  handleGetBlueprints(blueprintListItems: BlueprintListResponse) {
    this.working = false;
    if (blueprintListItems.blueprints == null || blueprintListItems.blueprints.length == 0) this.noMoreBlueprints = true;
    if (this.firstLoading) this.firstLoading = false;
      
    this.blueprintListItems = this.blueprintListItems.filter((i) => { return i != this.loadingBlueprintItem; });

    // TODO remove duplicates
    blueprintListItems.blueprints.map((item) => { this.blueprintListItems.push(item); });
    
    //this.recenter();
  }

  loadMoreBlueprints() {

    // Get the oldest date received
    // TODO oldest date and isLast in response
    this.working = true;
    this.appendTemp();

    let oldestDate = new Date();
    this.blueprintListItems.map((item) => { 
      let createdAt = new Date(item.createdAt);
      if (createdAt.getTime() < oldestDate.getTime()) oldestDate = createdAt; 
    })

    this.blueprintService.getBlueprints(oldestDate).subscribe({
      next: this.handleGetBlueprints.bind(this)
    });

  }
}
