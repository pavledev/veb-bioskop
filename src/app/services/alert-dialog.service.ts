import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class AlertDialogService
{
    constructor(private dialog: MatDialog)
    {
    }

    openDialog(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, showCancel: boolean = false)
    {
        return this.dialog.open(AlertDialogComponent, {
            width: '350px',
            data: { type, title, message, showCancel },
            disableClose: true
        }).afterClosed();
    }
}
