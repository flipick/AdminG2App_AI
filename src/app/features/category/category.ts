import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig } from '../../model/popupconfig';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddEditCategory } from './add-edit-category/add-edit-category';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category-service';
import { PermissionService } from '../../services/permission-service';
import { TenantService } from '../../services/tenant-service';
import { getTenantId } from '../../services/utility';
import { FormsModule } from '@angular/forms';
import { DeleteCategory } from './delete-category/delete-category';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrls: ['./category.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AddEditCategory,
    Popup,
    DeleteCategory,
  ],
})
export class Category {
  @ViewChild('popup') popup?: Popup;
  @ViewChild('addCategory') addCategoryComponent?: AddEditCategory;
  @ViewChild('deleteCategory') deleteCategoryComponent?: DeleteCategory;

  popupConfig: PopupConfig = new PopupConfig();
  categoryForm: FormGroup | undefined;

  categories: any[] = [];
  allCategories: any[] = [];
  tenantlist: any[] = [];
  selectedTenantId: any = null;
  permissions: any = {};
  selectedCategoryId: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private permissionService: PermissionService,
    private tenantService: TenantService
  ) {}

  ngOnInit() {
    this.permissions = this.permissionService.getPermission('AssessmentManagement');
    this.loadTenant();
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId() || (this.tenantlist.length > 0 ? this.tenantlist[0].tenantId : null);
          this.loadCategories();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching tenants:', err);
      },
    });
  }

  loadCategories() {
    const gridFilter = {
      PageIndex: 1,
      PageSize: 1000,
      Filter: [],
    };

    this.categoryService.getAllCategories(gridFilter).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.allCategories = res.result.data;
          this.filterCategoriesByTenant(this.selectedTenantId);
        } else {
          console.error('Failed to load categories:', res.message);
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  filterCategoriesByTenant(tenantId: string | null) {
    if (!tenantId) {
      this.categories = [...this.allCategories];
    } else {
      this.categories = this.allCategories.filter(
        (cat) => String(cat.tenantId) === String(tenantId)
      );
    }
  }

  filterByTenant(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const tenantId = selectElement.value;
    this.selectedTenantId = tenantId;
    this.filterCategoriesByTenant(tenantId);
  }

  openAddCategoryPopup() {
    this.popupConfig = {
      popupFunctionalityType: 'add',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Add Category',
      formGroup: this.categoryForm,
      buttons: [
        { label: 'Add Category', cssClass: 'bg-indigo-600 text-white', action: 'submit' },
        { label: 'Cancel', cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black', action: 'close' },
      ],
    };
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  openEditPopup(cat: any) {
    this.popupConfig = {
      popupFunctionalityType: 'edit',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Edit Category',
      formGroup: this.categoryForm,
      buttons: [
        { label: 'Update Category', cssClass: 'bg-indigo-600 text-white', action: 'submit' },
        { label: 'Cancel', cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black', action: 'close' },
      ],
    };
    setTimeout(() => {
      this.addCategoryComponent?.patchForm(cat);
      this.cdr.detectChanges();
    }, 0);
  }

  handlePopupAction(action: string) {
    switch (action) {
      case 'submit':
        this.addCategoryComponent?.submit();
        break;
      case 'close':
        this.addCategoryComponent?.close();
        break;
      case 'CategorySubmit':
        this.deleteCategoryComponent?.confirmDelete();
        break;
      case 'canceldeleteCategory':
        this.deleteCategoryComponent?.cancelDelete();
        break;
    }
  }

  closePopup() {
    this.popupConfig.isShowPopup = false;
  }

  onCategorySaved() {
    this.closePopup();
    this.loadCategories();
  }

  onCategoryDeleted() {
    this.closePopup();
    this.loadCategories();
  }

  deleteCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Category',
      buttons: [
        { label: 'Yes, Delete Category', cssClass: 'bg-primary-500 hover:bg-primary-700 text-white', action: 'custom', emitEventName: 'CategorySubmit' },
        { label: 'Cancel', cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black', action: 'custom', emitEventName: 'canceldeleteCategory' }
      ]
    };
  }
}
