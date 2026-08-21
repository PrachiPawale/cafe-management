import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxUiLoaderComponent } from 'ngx-ui-loader/lib/core/ngx-ui-loader.component';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss'],
})
export class ManageCategoryComponent implements OnInit {
  dataSource!: MatTableDataSource<any>;  
  responseMessage!: string;
  displayedColumns: string[] = [ 'name', 'actions', ];

  constructor(private categoryService:CategoryService,
    private ngxService:NgxUiLoaderService,
    private dialog:MatDialog,
    private snackbarService:SnackbarService,
    private router:Router) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.categoryService.getCategorys().subscribe((response:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);
    },(error:any)=>{
      this.ngxService.stop();
      if(error.error.message){
        this.responseMessage = error.error.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    })
  }

  applyFilter(event:Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  handleAddAction() {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = { action: 'Add' };
  dialogConfig.width = '850px';

  const dialogRef = this.dialog.open(CategoryComponent, dialogConfig);

  dialogRef.afterClosed().subscribe((result) => {
    if (result === true) {
      this.tableData();
    }
  });
}

  handleEditAction(values:any) {
        const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Edit',
      data:values
    }
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEditCategory.subscribe(
      (response)=>{
        this.tableData();
      }
    )
  }
  
  deleteCategory(id: any) {
  this.ngxService.start();
  this.categoryService.delete(id).subscribe(
    (response: any) => {
      this.ngxService.stop();
      this.responseMessage = response?.message || 'Category deleted successfully';
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
      this.tableData(); // Refresh table after delete
    },
    (error: any) => {
      this.ngxService.stop();
      if (error.error?.message) {
        this.responseMessage = error.error.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    }
  );
}

}
