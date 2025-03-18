import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';
import { MovieReviewService } from '../../services/movie.review.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-movie-review-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinner,
        NgClass
    ],
    templateUrl: './movie-review-dialog.component.html',
    styleUrl: './movie-review-dialog.component.css'
})
export class MovieReviewDialogComponent
{
    private readonly dialogReference: MatDialogRef<MovieReviewDialogComponent> = inject(MatDialogRef<MovieReviewDialogComponent>);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly movieReviewService: MovieReviewService = inject(MovieReviewService);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    public readonly movieReviewForm: FormGroup;

    private readonly movieId: string;
    public isCreatingMovieReview: boolean = false;
    public stars: boolean[] = Array(10).fill(false);
    public rating: number = 0;
    public hoveredRating: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { movieId: string })
    {
        this.movieId = data.movieId;

        this.movieReviewForm = this.formBuilder.group({
            title: ['', [Validators.required]],
            content: ['', [Validators.required]],
            rating: [null, [Validators.required]]
        });
    }

    async addReview()
    {
        if (this.movieReviewForm.invalid)
        {
            Object.values(this.movieReviewForm.controls).forEach(control => control.markAsDirty());

            return;
        }

        this.isCreatingMovieReview = true;
        this.movieReviewForm.disable();

        const { title, content, rating } = this.movieReviewForm.value;
        const error: string | null = await this.movieReviewService.addReview(this.movieId, title, content, rating);

        this.isCreatingMovieReview = false;
        this.movieReviewForm.enable();

        if (error)
        {
            this.snackBar.open(error, "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
        else
        {
            this.dialogReference.close();

            this.snackBar.open('Recenzija je uspešno kreirana.', "Zatvori", {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }

    cancel(): void
    {
        this.dialogReference.close(null);
    }

    setRating(value: number): void
    {
        this.rating = value;
        this.movieReviewForm.controls['rating'].setValue(value);
    }

    setHover(value: number): void
    {
        this.hoveredRating = value;
    }

    clearHover(): void
    {
        this.hoveredRating = 0;
    }
}
