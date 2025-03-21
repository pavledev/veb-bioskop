import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { forkJoin, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { CartItemModel } from '../../models/cart.item.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        AsyncPipe,
        MatCardModule
    ],
    templateUrl: './movie-details.component.html',
    styleUrl: './movie-details.component.css',
    providers: [MovieService, CartService, MovieReviewService]
})
export class MovieDetailsComponent implements OnInit, OnDestroy
{
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly dialog: MatDialog = inject(MatDialog);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly movieService: MovieService = inject(MovieService);
    private readonly movieReviewService: MovieReviewService = inject(MovieReviewService);
    private readonly userService: UserService = inject(UserService);
    private readonly cartService: CartService = inject(CartService);

    public movie: MovieModel | null = null;
    public error: string | null = null;
    public reviews$: Observable<(MovieReviewModel & { username: string | null })[]> = new Observable();
    private unsubscribe$: Subject<void> = new Subject<void>();

    @ViewChild('galleryContainer', { static: false }) public galleryContainer!: ElementRef;

    public averageRating: number = 0;
    public ratingDistribution: { stars: number, count: number }[] = [];
    public totalReviews: number = 0;
    public maxRatingCount: number = 0;

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
                distributorName: response.data.distributorName
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

            this.reviews$ = this.movieReviewService.getReviewsByMovieId(this.movie.movieId).pipe(
                switchMap(reviews =>
                {
                    if (!reviews || reviews.length === 0)
                    {
                        return of([]);
                    }

                    const usernameObservables = reviews.map(review =>
                        this.userService.getUsername(review.userId).pipe(
                            map(username => ({ ...review, username }))
                        )
                    );

                    return forkJoin(usernameObservables);
                })
            );

            this.reviews$.pipe(takeUntil(this.unsubscribe$)).subscribe(reviews =>
            {
                if (reviews && reviews.length > 0)
                {
                    const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
                    this.averageRating = totalScore / reviews.length;
                    this.totalReviews = reviews.length;
                    this.ratingDistribution = this.calculateRatingDistribution(reviews);
                    this.maxRatingCount = Math.max(...this.ratingDistribution.map(r => r.count), 1);
                }
                else
                {
                    this.averageRating = 0;
                    this.totalReviews = 0;
                    this.ratingDistribution = Array.from({ length: 10 }, (_, i) => ({ stars: 10 - i, count: 0 }));
                    this.maxRatingCount = 1;
                }
            });
        }
    }

    ngOnDestroy()
    {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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

    getStarIcons(): string[]
    {
        let rating = this.averageRating;
        const stars: string[] = [];

        for (let i = 0; i < 10; i++)
        {
            if (rating >= 1)
            {
                stars.push('star');
            }
            else if (rating >= 0.5)
            {
                stars.push('star_half');
            }
            else
            {
                stars.push('star_outline');
            }
            rating--;
        }

        return stars;
    }

    calculateRatingDistribution(reviews: any[]): { stars: number, count: number }[]
    {
        const distribution = Array.from({ length: 10 }, (_, i) => ({ stars: 10 - i, count: 0 }));

        reviews.forEach(review =>
        {
            if (review.rating >= 1 && review.rating <= 10)
            {
                distribution[10 - review.rating].count++;
            }
        });

        return distribution;
    }

    getRatingDistribution()
    {
        return this.ratingDistribution.map(rating => ({
            ...rating,
            percentage: this.totalReviews > 0 ? (rating.count / this.totalReviews) * 100 : 0
        }));
    }

    addToCart(): void
    {
        if (!this.movie)
        {
            return;
        }

        const cartItem: CartItemModel = {
            title: this.movie.title,
            posterPath: this.movie.posterPath
        };

        this.cartService.addToCart(cartItem);

        this.snackBar.open('Film je uspešno dodat u korpu.', 'Zatvori', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }
}
