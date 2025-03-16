import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { AxiosError } from 'axios';
import { MovieModel } from '../../models/movie.model';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PosterDialogComponent } from '../poster-dialog/poster-dialog.component';
import { GalleryDialogComponent } from '../gallery-dialog/gallery-dialog.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-movie-details',
    imports: [
        LoadingComponent,
        DatePipe,
        MatButtonModule,
        MatIcon,
        MatSelectModule,
        NgForOf,
        NgIf
    ],
    templateUrl: './movie-details.component.html',
    styleUrl: './movie-details.component.css',
    providers: [MovieService]
})
export class MovieDetailsComponent implements OnInit
{
    private movieService: MovieService = inject(MovieService);
    private route: ActivatedRoute = inject(ActivatedRoute);
    private readonly dialog: MatDialog = inject(MatDialog);
    public movie: MovieModel | null = null;
    public error: string | null = null;

    @ViewChild('galleryContainer', { static: false }) galleryContainer!: ElementRef;

    averageRating = 0;
    totalReviews = 0;
    ratingCounts = [0, 0, 0, 0, 0]; // Counts for each rating (1-5 stars)
    ngOnInit(): void
    {
        const movieSlug: string | null = this.route.snapshot.paramMap.get('slug');

        this.movieService
            .getMovieDetails(movieSlug)
            .then(response =>
            {
                this.movie = {
                    movieId: response.data.id,
                    title: response.data.title,
                    originalTitle: response.data.titleOriginalCalculated,
                    description: response.data.synopsis,
                    startDate: response.data.startDate,
                    duration: response.data.runTime,
                    posterPath: response.data.posterImage,
                    trailerUrl: response.data.trailerUrl,
                    genres: response.data.genres,
                    gallery: response.data.gallery,
                    actors: response.data.actors,
                    directors: response.data.directors,
                    technologies: [response.data.availableTechCMS[0].Description.substring(3, 5)],
                    distributorName: response.data.distributorName,
                };
            })
            .catch((e: AxiosError) => this.error = `${e.code}: ${e.message}`);
    }

    prevImage(): void
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

    openPosterModal(): void
    {
        if (!this.movie)
        {
            return;
        }

        this.dialog.open(PosterDialogComponent, {
            data: {
                posterPath: this.movie.posterPath,
                title: this.movie.title
            },
            panelClass: 'custom-container'
        });
    }

    openGalleryDialog(index: number): void
    {
        if (!this.movie)
        {
            return;
        }

        this.dialog.open(GalleryDialogComponent, {
            data: {
                images: this.movie.gallery,
                index: index
            },
            width: '60vw',
            maxWidth: '80vh',
            panelClass: 'custom-container'
        });
    }
}
