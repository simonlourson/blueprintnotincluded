import { DrawHelpers } from '../../drawing/draw-helpers';
import { OniItem } from '../oni-item';

// Categories for the build tool (exported from the game) 
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
  public static allCategories: BuildMenuCategory
  public static buildMenuCategories: BuildMenuCategory[];
  public static init()
  {
    BuildMenuCategory.buildMenuCategories = [];

    BuildMenuCategory.allCategories = new BuildMenuCategory();
    BuildMenuCategory.allCategories.category = -1;
    BuildMenuCategory.allCategories.categoryName = 'All';
    BuildMenuCategory.allCategories.categoryIcon = 'icon_category_base';
    BuildMenuCategory.allCategories.categoryIconUrl = DrawHelpers.createUrl(BuildMenuCategory.allCategories.categoryIcon, true);
  }

  public static getCategory(category: number): BuildMenuCategory
  {
    if (BuildMenuCategory.buildMenuCategories != null)
      for (let buildCategory of BuildMenuCategory.buildMenuCategories)
        if (buildCategory.category == category)
          return buildCategory;

    return null;
  }

  public static getCategoryFromItem(oniItem: OniItem): BuildMenuCategory
  {
    if (BuildMenuItem.buildMenuItems != null)
      for (let buildMenuItem of BuildMenuItem.buildMenuItems)
        if (buildMenuItem.buildingId == oniItem.id)
          return BuildMenuCategory.getCategory(buildMenuItem.category);
        
    return null;
  }

  public static load(buildMenuCategories: BuildMenuCategory[])
  {
    for (let original of buildMenuCategories)
    {
      let newBuildMenuCategory = new BuildMenuCategory();
      newBuildMenuCategory.importFrom(original);

      BuildMenuCategory.buildMenuCategories.push(newBuildMenuCategory);
    }
  }
}

// Buildings for the build tool (exported from the game) 
export class BuildMenuItem
{
  category: number;
  buildingId: string;

  public importFrom(original: BuildMenuItem)
  {
    this.category = original.category;
    this.buildingId = original.buildingId;
  }

  // Static 
  public static buildMenuItems: BuildMenuItem[];
  public static init()
  {
    BuildMenuItem.buildMenuItems = [];
  }

  public static load(buildMenuitems: BuildMenuItem[])
  {
    for (let original of buildMenuitems)
    {
      let newBuildMenuItem = new BuildMenuItem();
      newBuildMenuItem.importFrom(original);

      BuildMenuItem.buildMenuItems.push(newBuildMenuItem);
    }
  }
}