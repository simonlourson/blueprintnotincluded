import { Component, OnInit, ViewChild } from '@angular/core';
declare var PIXI: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  
  @ViewChild('pixiContainer', {static: true}) 
  pixiContainer;

  public pApp: any;
  ngOnInit(): void {
    this.pApp = new PIXI.Application({ width: 800, height: 600 }); // this creates our pixi application
    this.pixiContainer.nativeElement.appendChild(this.pApp.view);
  }

  title = 'blueprintnotincluded';
}
