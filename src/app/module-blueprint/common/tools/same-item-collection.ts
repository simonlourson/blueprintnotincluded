import { TemplateItem } from '../template/template-item';
import { OniItem } from '../oni-item';
import { CameraService } from '../../services/camera-service';

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
    }
  }

  oniItem: OniItem;
  items: TemplateItem[];

  constructor() {
    this.items = [];
  }

  setSelection() {
    for (let item of this.items) {
      item.selectedMultiple = this.selected_;
    }
  }
}