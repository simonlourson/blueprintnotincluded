import { ReturnStatement } from '@angular/compiler';
import { DrawHelpers } from '../../drawing/draw-helpers';

export class BUiScreen {
  id: string;
  inputs: string[];

  constructor(id: string) {
    this.id = id;
  }

  getDefaultValue(index: number): any { return null; }

  importFrom(original: BUiScreen) {
    this.inputs = [];
    for (let value of original.inputs) this.inputs.push(value)
  }

  static clone(original: BUiScreen) {
    if (original.id == 'SingleSliderSideScreen') {
      let returnValue = new BSingleSliderSideScreen(original.id);
      returnValue.importFrom(original as BSingleSliderSideScreen);
      return returnValue;
    }
    else if (original.id == 'ThresholdSwitchSideScreen') {
      let returnValue = new BThresholdSwitchSideScreen(original.id);
      returnValue.importFrom(original as BThresholdSwitchSideScreen);
      return returnValue;
    }
  }
}

export class UiSaveSettings {
  id: string;
  values: any[];

  constructor(id: string) {
    this.id = id;
    this.values = [];
  }

  public importFrom(original: UiSaveSettings) {
    for (let value of original.values) this.values.push(value);
  }

  public static clone(original: UiSaveSettings): UiSaveSettings {
    let returnValue = new UiSaveSettings(original.id);
    returnValue.importFrom(original);
    return returnValue;
  }
}

export class BSingleSliderSideScreen extends BUiScreen {
  
  public title: string;
  public sliderUnits: string;
  public min: number;
  public max: number;
  public tooltip: string;
  public sliderDecimalPlaces: number;
  public defaultValue: number;

  constructor(id: string) {
    super(id);
  }

  getDefaultValue(index: number): any { 
    if (index == 0) return this.defaultValue;
    else return null;
  }

  importFrom(original: BSingleSliderSideScreen) {
    super.importFrom(original);
    this.title = original.title;
    this.sliderUnits = original.sliderUnits;
    this.min = original.min;
    this.max = original.max;
    this.tooltip = DrawHelpers.stripHtml(original.tooltip);
    this.sliderDecimalPlaces = original.sliderDecimalPlaces;
    this.defaultValue = original.defaultValue;
  }
}

export class BThresholdSwitchSideScreen extends BUiScreen {
  
  public title: string;
  public aboveToolTip: string;
  public belowToolTip: string;
  public thresholdValueName: string;
  public thresholdValueUnits: string;
  public rangeMin: number;
  public rangeMax: number;
  public incrementScale: number;
  public defaultValue: number;
  public defaultBoolean: boolean;

  constructor(id: string) {
    super(id);
  }

  getDefaultValue(index: number): any { 
    if (index == 0) return this.defaultValue;
    else if (index == 1) return this.defaultBoolean;
    else return null;
  }

  importFrom(original: BThresholdSwitchSideScreen) {
    super.importFrom(original);
    this.title = original.title;
    this.aboveToolTip = original.aboveToolTip;
    this.belowToolTip = original.belowToolTip;
    this.thresholdValueName = original.thresholdValueName;
    this.thresholdValueUnits = original.thresholdValueUnits;
    this.rangeMin = original.rangeMin;
    this.rangeMax = original.rangeMax;
    this.incrementScale = original.incrementScale;
    this.defaultValue = original.defaultValue;
    this.defaultBoolean = original.defaultBoolean;
  }
}