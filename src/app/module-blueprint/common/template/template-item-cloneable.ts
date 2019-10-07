import { OniBuilding } from "../../oni-import/oni-building";

export interface TemplateItemCloneable<T>
{
  // Import from the building part of the yaml file
  importOniBuilding(building: OniBuilding);

  // Restore default values if they are not defined
  cleanUp();

  // Clone this item
  clone(): T;

  // Clone for new building
  cloneForBuilding(): T;

  // Clone this item (we need a clone because we will delete values for the export)
  cloneForExport(): T;

  // Copy the values from the original
  copyFromForExport(original: T)

  // Delete values if they are the default values
  deleteDefaultForExport();

}