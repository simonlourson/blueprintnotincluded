import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlueprintItem } from 'src/app/module-blueprint/common/blueprint/blueprint-item';

@Component({
  selector: 'app-temperature-picker',
  templateUrl: './temperature-picker.component.html',
  styleUrls: ['./temperature-picker.component.css']
})
export class TemperaturePickerComponent implements OnInit {

  // temperature
  @Input() blueprintItem: BlueprintItem;
  @Input() temperatureWarning: boolean;

  @Output() changeTemperature: EventEmitter<number> = new EventEmitter<number>();

  get temperatureLabel() { return this.blueprintItem.temperatureCelcius.toFixed(1) + '°C' }

  constructor() { }

  ngOnInit() {
  }

  onChange() {
    this.changeTemperature.emit(this.blueprintItem.temperature);
  }

}
