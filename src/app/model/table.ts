export class SortModel {
    columnName?: string="";
    orderBy: number=-1;
    sortType: string='';
    condition?: any;
  }

  export class PageAccess {
    key?: number;
    value?: string;   
  }

  export class FilterDetails{
    colId?: string;
    name?: string;
    value?: string;
    type?: string;
  } 

  export class GridConfig
  {
    isServerSidePagination: boolean = true;
    isShowFilter: boolean = false;
    isShowSorting: boolean = false;
  }

  export class InsertionDetails{
    colId?: string;
    name?: string;
    value?: string;   
  }