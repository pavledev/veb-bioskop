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

    confirm(): void
    {
        this.dialogRef.close(true);
    }

    cancel(): void
    {
        this.dialogRef.close(false);
    }
}
