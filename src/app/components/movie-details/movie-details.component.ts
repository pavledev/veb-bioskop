import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PosterDialogComponent } from '../poster-dialog/poster-dialog.component';
import { GalleryDialogComponent } from '../gallery-dialog/gallery-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MovieReviewDialogComponent } from '../movie-review-dialog/movie-review-dialog.component';
import { MovieReviewModel } from '../../models/movie.review.model';
import { MovieReviewService } from '../../services/movie.review.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-movie-details',
    imports: [
        LoadingComponent,
        DatePipe,
        MatButtonModule,
        MatIcon,
        MatSelectModule,
        NgForOf,
        NgIf,
        NgStyle,
        AsyncPipe
    ],
    templateUrl: './movie-details.component.html',
    styleUrl: './movie-details.component.css',
    providers: [MovieService]
})
export class MovieDetailsComponent implements OnInit
{
    private route: ActivatedRoute = inject(ActivatedRoute);
    private readonly dialog: MatDialog = inject(MatDialog);
    private movieService: MovieService = inject(MovieService);
    private movieReviewService: MovieReviewService = inject(MovieReviewService);

    public movie: MovieModel | null = null;
    public error: string | null = null;
    public reviews$: Observable<MovieReviewModel[]> = new Observable<MovieReviewModel[]>();

    @ViewChild('galleryContainer', { static: false }) galleryContainer!: ElementRef;

    totalReviews = '10.0k';
    growthPercentage = 21;
    averageRating = 4.5;
    ratingDistribution = [
        { stars: 5, count: 2000, color: '#16a34a' }, // Green
        { stars: 4, count: 1000, color: '#c084fc' }, // Purple
        { stars: 3, count: 500, color: '#facc15' },  // Yellow
        { stars: 2, count: 200, color: '#06b6d4' },  // Blue
        { stars: 1, count: 0, color: '#dc2626' }     // Red
    ];
    maxRatingCount = Math.max(...this.ratingDistribution.map(r => r.count));
    async ngOnInit()
    {
        const movieSlug: string | null = this.route.snapshot.paramMap.get('slug');

        const [error, response] = await this.movieService.getMovieDetails(movieSlug);

        if (error)
        {
            this.error = error.message;
        }
        else
        {
            this.movie = {
                movieId: response.data.id,
                title: response.data.title,
                originalTitle: response.data.titleOriginalCalculated,
                description: response.data.synopsis,
                startDate: response.data.startDate,
                duration: response.data.runTime,
                posterPath: response.data.posterImage,
                trailerUrl: '',
                genres: response.data.genres,
                gallery: response.data.gallery,
                actors: response.data.actors,
                directors: response.data.directors,
                technologies: [response.data.availableTechCMS[0].Description.substring(3, 5)],
                distributorName: response.data.distributorName,
            };

            const [error2, response2] = await this.movieService.getTrailerURL(response.data.title);

            if (error2)
            {
                this.error = error2.message;
            }
            else
            {
                this.movie.trailerUrl = response2.data[0].trailerUrl;
            }

            this.reviews$ = this.movieReviewService.getReviewsByMovieId(this.movie.movieId);
        }
    }

    previousImage(): void
    {
        if (this.galleryContainer)
        {
            this.galleryContainer.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
        }
    }

    nextImage(): void
    {
        if (this.galleryContainer)
        {
            this.galleryContainer.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
        }
    }

    formatDuration(duration: number): string
    {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    openPosterDialog(): void
    {
        this.dialog.open(PosterDialogComponent, {
            data: {
                posterPath: this.movie?.posterPath,
                title: this.movie?.title
            },
            panelClass: 'custom-container'
        });
    }

    openGalleryDialog(index: number): void
    {
        this.dialog.open(GalleryDialogComponent, {
            data: {
                images: this.movie?.gallery,
                index: index
            },
            width: '60vw',
            maxWidth: '80vh',
            panelClass: 'custom-container'
        });
    }

    openMovieReviewDialog(): void
    {
        const buttonElement = document.activeElement as HTMLElement;

        buttonElement.blur();

        this.dialog.open(MovieReviewDialogComponent, {
            data: {
                movieId: this.movie?.movieId
            },
        });
    }
}
