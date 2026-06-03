import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  exito(mensaje: string) {
    this.snackBar.open(mensaje, '', {
      duration: 2800,
      panelClass: ['cherry-toast', 'cherry-toast-exito'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(mensaje: string) {
    this.snackBar.open(mensaje, '', {
      duration: 3500,
      panelClass: ['cherry-toast', 'cherry-toast-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
