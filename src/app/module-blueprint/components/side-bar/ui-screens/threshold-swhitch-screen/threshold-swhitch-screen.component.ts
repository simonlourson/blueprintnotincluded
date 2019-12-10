import { Component, OnInit, Input } from '@angular/core';
import { BlueprintItem } from 'src/app/module-blueprint/common/blueprint/blueprint-item';
import { BThresholdSwitchSideScreen } from 'src/app/module-blueprint/common/bexport/b-ui-screen';

@Component({
  selector: 'app-threshold-switch-screen',
  templateUrl: './threshold-swhitch-screen.component.html',
  styleUrls: ['./threshold-swhitch-screen.component.css']
})
export class ThresholdSwhitchScreenComponent implements OnInit {

  @Input() blueprintItem: BlueprintItem;
  @Input() thresholdSwitchSideScreen: BThresholdSwitchSideScreen;

  above: boolean;
  value: number;

  get classAbove() { return "button-item " + (this.above ? "ui-button-info" : "ui-button-secondary") }
  get classBelow() { return "button-item " + (this.above ? "ui-button-secondary" : "ui-button-info") }

  constructor() { }

  ngOnInit() {
    this.value = this.blueprintItem.getUiSettings(this.thresholdSwitchSideScreen.id).values[0] as number;
    this.above = this.blueprintItem.getUiSettings(this.thresholdSwitchSideScreen.id).values[1] as boolean;
  }

  clickAbove() {
    this.above = true;
    this.blueprintItem.getUiSettings(this.thresholdSwitchSideScreen.id).values[1] = this.above;
  }

  clickBelow() {
    this.above = false;
    this.blueprintItem.getUiSettings(this.thresholdSwitchSideScreen.id).values[1] = this.above;
  }

  onChange() {
    this.blueprintItem.getUiSettings(this.thresholdSwitchSideScreen.id).values[0] = this.value;
  }

}
