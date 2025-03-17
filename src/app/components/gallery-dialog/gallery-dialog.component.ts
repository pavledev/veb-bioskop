import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-gallery-dialog',
    imports: [
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './gallery-dialog.component.html',
    styleUrl: './gallery-dialog.component.css'
})
export class GalleryDialogComponent
{
    private readonly dialogRef: MatDialogRef<GalleryDialogComponent> = inject(MatDialogRef<GalleryDialogComponent>);
    currentIndex: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { images: string[], index: number })
    {
        this.currentIndex = data.index;
    }

    close(): void
    {
        this.dialogRef.close();
    }

    previousImage(): void
    {
        if (this.currentIndex > 0)
        {
            this.currentIndex--;
        }
    }

    nextImage(): void
    {
        if (this.currentIndex < this.data.images.length - 1)
        {
            this.currentIndex++;
        }
    }
}
