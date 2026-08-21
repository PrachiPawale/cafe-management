import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/material-component/dialog/view-bill-products/change-password/change-password.component';
import { ConfirmationComponent } from 'src/app/material-component/dialog/view-bill-products/confirmation/confirmation.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent implements OnInit {
  role: any;
  animationsEnabled = true;

  constructor(private router: Router,
    private dialog: MatDialog) {

  }

  ngOnInit(): void {
    const storedValue = localStorage.getItem('animationsEnabled');
    this.animationsEnabled = storedValue === null ? true : storedValue === 'true';
    this.applyAnimationPreference();
  }

  toggleAnimations(enabled: boolean): void {
    this.animationsEnabled = enabled;
    localStorage.setItem('animationsEnabled', String(enabled));
    this.applyAnimationPreference();
  }

  private applyAnimationPreference(): void {
    const body = document.body;
    const root = document.documentElement;
    const className = 'animations-disabled';

    body.classList.toggle(className, !this.animationsEnabled);
    root.classList.toggle(className, !this.animationsEnabled);
  }

  logout() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout'
    };
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((user)=>{
      dialogRef.close();
      localStorage.clear();
      this.router.navigate(['']);
    })
  }

  changePassword(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "550px";
    this.dialog.open(ChangePasswordComponent,dialogConfig);
  }

}
