import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-alert-dialog',
    imports: [MatDialogModule, MatIconModule, MatButtonModule],
    templateUrl: './alert-dialog.component.html',
    styleUrl: './alert-dialog.component.css'
})
export class AlertDialogComponent
{
    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            type: 'success' | 'error' | 'warning' | 'info',
            title: string,
            message: string,
            showCancelButton?: boolean
        }
    )
    {
    }

    getIcon(): string
    {
        switch (this.data.type)
        {
            case 'success':
                return 'check';
            case 'error':
                return 'close';
            case 'warning':
                return 'priority_high';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    }
}
