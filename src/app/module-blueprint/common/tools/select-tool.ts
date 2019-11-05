import { BlueprintService } from '../../services/blueprint-service';
import { TemplateItem } from '../template/template-item';
import { Vector2 } from '../vector2';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SelectTool
{
  public itemsChanged: Observable<number>;
  public templateItemsToShow: TemplateItem[];

  private observers: IObsTemplateItemChanged[];

  constructor(private blueprintService: BlueprintService) {
    this.templateItemsToShow = [];
    this.itemsChanged = new Observable<number>();

    this.observers = [];
  }

  public subscribe(subscriber: IObsTemplateItemChanged)
  {
    this.observers.push(subscriber);
  }

  leftClick(tile: Vector2)
  {
    this.updateSelectionTool(tile);
  }

  public updateSelectionTool(tile: Vector2)
  {
    console.log('updateSelectionTool')
    this.templateItemsToShow = this.blueprintService.blueprint.getTemplateItemsAt(tile);
    this.pushChanges();
  }

  pushChanges()
  {
    this.observers.map((observer) => observer.itemsChanged())
  }
}

export interface IObsTemplateItemChanged
{
  itemsChanged();
}