import { Component, OnInit } from '@angular/core';
import { CameraService, DrawHelpers, TemperatureThreshold, Visualization } from '../../../../../../../blueprintnotincluded-lib/index';

@Component({
  selector: 'app-temperature-scale',
  templateUrl: './temperature-scale.component.html',
  styleUrls: ['./temperature-scale.component.css']
})
export class TemperatureScaleComponent implements OnInit {

  temperatureData: TemperatureThreshold[];

  private cameraService: CameraService

  constructor() { 

    this.cameraService = CameraService.cameraService;

    this.temperatureData = [];
    for (let i = DrawHelpers.temperatureThresholds.length - 2; i >= 0; i--)
      this.temperatureData.push(DrawHelpers.temperatureThresholds[i]);
  }

  ngOnInit() {
  }

  temperatureColor(index: number) {
    return DrawHelpers.colorToHex(this.temperatureData[index].color);
  }

  temperatureRange(index: number) {
    if (index == 0) return '(Above ' + (this.temperatureData[index].temperature - 273.15).toFixed(0) + '°C)';
    else return '(' + (this.temperatureData[index].temperature - 273.15).toFixed(0) + '°C ~ ' + (this.temperatureData[index-1].temperature - 273.15).toFixed(0) + '°C)';
  }

  close() {
    this.cameraService.visualization = Visualization.none;
  }
}
