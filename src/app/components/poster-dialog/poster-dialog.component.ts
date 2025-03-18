import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-poster-dialog',
    imports: [
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './poster-dialog.component.html',
    styleUrl: './poster-dialog.component.css'
})
export class PosterDialogComponent
{
    private readonly dialogReference = inject(MatDialogRef<PosterDialogComponent>);

    constructor(@Inject(MAT_DIALOG_DATA) public data: { posterPath: string; title: string })
    {
    }

    close(): void
    {
        this.dialogReference.close();
    }
}
