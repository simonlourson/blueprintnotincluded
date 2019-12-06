import { BlueprintItem } from '../blueprint/blueprint-item';
import { OniItem } from '../oni-item';
import { CameraService } from '../../services/camera-service';
import { BlueprintService } from '../../services/blueprint-service';

export class SameItemCollection
{
  private selected_: boolean;
  get selected() {return this.selected_;}
  set selected(value: boolean) {
    this.selected_ = value;
    this.setSelection();
    if (this.selected_) {
      CameraService.cameraService.resetSinWave();
      CameraService.cameraService.setOverlayForItem(this.oniItem);
      this.observersSelected.map((observer) => { observer.selected(); })
    }
  }

  oniItem: OniItem;
  items: BlueprintItem[];

  constructor() {
    this.items = [];

    this.observersSelected = [];
  }

  setSelection() {
    for (let item of this.items) {
      item.selectedMultiple = this.selected_;
    }
  }

  destroyAll() {
    for (let item of this.items)
      BlueprintService.blueprintService.blueprint.destroyBlueprintItem(item);
  }

  private observersSelected: IObsSelected[];
  public subscribeSelected(observer: IObsSelected) {
    this.observersSelected.push(observer);
  }
}

export interface IObsSelected {
  selected();
}