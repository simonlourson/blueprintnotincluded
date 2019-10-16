import { DrawHelpers } from '../../drawing/draw-helpers';

export class BuildMenuCategory
{
  category: number;
  categoryName: string;
  categoryIcon: string;
  categoryIconUrl: string;

  public importFrom(original: BuildMenuCategory)
  {
    this.category = original.category;
    this.categoryName = original.categoryName
    this.categoryIcon = original.categoryIcon;
    this.categoryIconUrl = DrawHelpers.createUrl(this.categoryIcon, true);
  }

  // Static 
  public static buildMenuCategories: BuildMenuCategory[];
  public static init()
  {
    BuildMenuCategory.buildMenuCategories = [];

    let allItems = new BuildMenuCategory();
    allItems.category = -1;
    allItems.categoryName = 'All';
    allItems.categoryIcon = 'icon_category_base';
    allItems.categoryIconUrl = DrawHelpers.createUrl(allItems.categoryIcon, true);

    BuildMenuCategory.buildMenuCategories.push(allItems);
  }
}