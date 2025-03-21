import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { AxiosError } from 'axios';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../loading/loading.component';
import { UtilityService } from '../../services/utility.service';
import { ErrorComponent } from '../error/error.component';
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import { GenreService } from '../../services/genre.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ProjectionService } from '../../services/projection.service';
import { ProjectionModel } from '../../models/projection.model';
import { Subject, takeUntil } from 'rxjs';
import { CartItemModel } from '../../models/cart.item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../services/cart.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-movies',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        RouterLink,
        MatFormField,
        MatProgressSpinnerModule,
        LoadingComponent,
        ErrorComponent,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatSliderModule,
        FormsModule,
        MatDatepickerModule,
        MatSelectModule,
        MatInputModule,
        DatePipe
    ],
    templateUrl: './movies.component.html',
    styleUrl: './movies.component.css',
    providers: [MovieService, GenreService, ProjectionService, CartService, provideNativeDateAdapter()]
})
export class MoviesComponent implements OnInit, OnDestroy
{
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly movieService: MovieService = inject(MovieService);
    private readonly genreService: GenreService = inject(GenreService);
    public readonly projectionService: ProjectionService = inject(ProjectionService);
    private readonly cartService: CartService = inject(CartService);
    public readonly utilityService: UtilityService = inject(UtilityService);
    public readonly filterForm: FormGroup;
    private readonly unsubscribe$: Subject<void> = new Subject<void>();

    @Input() category: 'recommended' | 'now-playing' | 'coming-soon' = 'recommended';
    public error: string | null = null;
    public allMovies: MovieModel[] | null = null;
    public movies: MovieModel[] | null = null;
    public genres: string[] | [] = [];
    public directors: string[] = [];
    public actors: string[] = [];
    public readonly ratings: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    public sortOption: string = 'title_asc';

    constructor()
    {
        this.filterForm = this.formBuilder.group({
            genres: new FormArray([]),
            directors: new FormArray([]),
            actors: new FormArray([]),
            ratings: new FormArray(this.ratings.map(() => this.formBuilder.control(false))),
            durationRange: this.formBuilder.group({
                min: [30],
                max: [240]
            }),
            priceRange: this.formBuilder.group({
                min: [500],
                max: [1000]
            }),
            releaseDateRange: this.formBuilder.group({
                start: [null],
                end: [null]
            }),
            projectionDateRange: this.formBuilder.group({
                start: [null],
                end: [null]
            }),
            searchQuery: ['']
        });
    }

    async ngOnInit()
    {
        let getMovies;

        switch (this.category)
        {
            case 'recommended':
                getMovies = this.movieService.getRecommendedMovies();
                break;
            case 'now-playing':
                getMovies = this.movieService.getMovies();
                break;
            case 'coming-soon':
                getMovies = this.movieService.getComingSoonMovies();
                break;
            default:
                return;
        }

        const [error, response] = await getMovies;

        if (error)
        {
            this.error = error.message;
        }
        else
        {
            this.allMovies = response.data.map((movie: any) => ({
                movieId: movie.id,
                title: movie.title,
                originalTitle: movie.titleOriginalCalculated,
                description: movie.synopsis,
                startDate: movie.startDate,
                duration: movie.runTime,
                posterPath: movie.posterImage,
                trailerUrl: movie.trailerUrl,
                genres: movie.genres,
                gallery: movie.gallery,
                actors: movie.actors,
                directors: movie.directors,
                technologies: ["2D"],
                distributorName: movie.distributorName,
            }));

            this.movies = this.allMovies ? [...this.allMovies] : [];

            await this.projectionService.generateProjections();

            response.data.forEach((movie: any) =>
            {
                this.directors.push(...movie.directors);
                this.actors.push(...movie.actors);
            });

            this.directors = this.utilityService.sortArray(this.utilityService.removeDuplicates(this.directors));
            this.actors = this.utilityService.sortArray(this.utilityService.removeDuplicates(this.actors));

            const directorFormArray = this.filterForm.get('directors') as FormArray;
            const actorFormArray = this.filterForm.get('actors') as FormArray;

            this.directors.forEach(() =>
            {
                directorFormArray.push(new FormControl<boolean>(false));
            });

            this.actors.forEach(() =>
            {
                actorFormArray.push(new FormControl<boolean>(false));
            });
        }

        const [error2, genres] = await this.genreService.getGenres();

        if (error2)
        {
            this.error = error2.message;
        }
        else
        {
            this.genres = genres;

            const genreFormArray = this.filterForm.get('genres') as FormArray;

            genres.forEach(() =>
            {
                genreFormArray.push(new FormControl<boolean>(false));
            });
        }

        this.applySorting();

        this.filterForm.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() =>
            {
                console.log('exec')
                this.applyFilters();
            });

        this.filterForm.get('releaseDateRange.start')?.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() =>
            {
                this.applyFilters();
            });

        this.filterForm.get('releaseDateRange.end')?.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() =>
            {
                this.applyFilters();
            });

        this.filterForm.get('projectionDateRange.start')?.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() =>
            {
                this.applyFilters();
            });

        this.filterForm.get('projectionDateRange.end')?.valueChanges
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() =>
            {
                this.applyFilters();
            });
    }

    ngOnDestroy()
    {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    applyFilters()
    {
        const selectedGenres: string[] = this.genres.filter((genre: string, index: number): any => this.filterForm.value.genres[index]);
        const selectedDirectors: string[] = this.directors.filter((director: string, index: number): any => this.filterForm.value.directors[index]);
        const selectedActors: string[] = this.actors.filter((actor: string, index: number): any => this.filterForm.value.actors[index]);
        const selectedRatings: number[] = this.ratings.filter((rating: number, index: number): any => this.filterForm.value.ratings[index]);

        const durationRange = this.filterForm.value.durationRange;
        const priceRange = this.filterForm.value.priceRange;
        const releaseDateRange = this.filterForm.value.releaseDateRange;
        const projectionDateRange = this.filterForm.value.projectionDateRange;

        const searchQuery: string = this.filterForm.value.searchQuery?.toLowerCase() || '';

        const projections: ProjectionModel[] = this.projectionService.getProjections();

        this.movies = this.allMovies?.filter((movie, index: number) =>
        {
            const genreMatch = selectedGenres.length === 0 || movie.genres.some((genre) => selectedGenres.includes(genre));
            const directorMatch = selectedDirectors.length === 0 || movie.directors.some((director) => selectedDirectors.includes(director));
            const actorMatch = selectedActors.length === 0 || movie.actors.some((actor) => selectedActors.includes(actor));
            //const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(movie.rating);
            const durationMatch = movie.duration >= durationRange.min && movie.duration <= durationRange.max;
            const priceMatch = projections[index].price >= priceRange.min && projections[index].price <= priceRange.max;

            const releaseDate = new Date(movie.startDate);
            const releaseDateMatch =
                (!releaseDateRange.start || releaseDate >= new Date(releaseDateRange.start)) &&
                (!releaseDateRange.end || releaseDate <= new Date(releaseDateRange.end));

            const projectionDateMatch =
                (!projectionDateRange.start || releaseDate >= new Date(projectionDateRange.start)) &&
                (!projectionDateRange.end || releaseDate <= new Date(projectionDateRange.end));

            const searchMatch = !searchQuery || movie.title.toLowerCase().includes(searchQuery) || movie.description.toLowerCase().includes(searchQuery);

            return (
                genreMatch &&
                directorMatch &&
                actorMatch &&
                //ratingMatch &&
                durationMatch &&
                priceMatch &&
                releaseDateMatch &&
                projectionDateMatch &&
                searchMatch
            );
        }) ?? [];
    }

    onSortChange(option: string)
    {
        this.sortOption = option;

        this.applySorting();
    }

    applySorting()
    {
        if (this.sortOption)
        {
            this.movies?.sort((movie1: MovieModel, movie2: MovieModel) =>
            {
                const projections: ProjectionModel[] = this.projectionService.getProjections();
                const projection1 = projections.find(projection => projection.title == movie1.title);
                const projection2 = projections.find(projection => projection.title == movie2.title);

                switch (this.sortOption)
                {
                    case 'title_asc':
                        return movie1.title.localeCompare(movie2.title);
                    case 'title_desc':
                        return movie2.title.localeCompare(movie1.title);
                    case 'price_asc':
                        return (projection1?.price || 0) - (projection2?.price || 0);
                    case 'price_desc':
                        return (projection2?.price || 0) - (projection1?.price || 0);
                    default:
                        return 0;
                }
            });
        }
    }

    get minDuration(): number
    {
        return this.filterForm.get('durationRange.min')?.value;
    }

    get maxDuration(): number
    {
        return this.filterForm.get('durationRange.max')?.value;
    }

    get minPrice(): number
    {
        return this.filterForm.get('priceRange.min')?.value;
    }

    get maxPrice(): number
    {
        return this.filterForm.get('priceRange.max')?.value;
    }

    addToCart(movie: MovieModel): void
    {
        const cartItem: CartItemModel = {
            title: movie.title,
            posterPath: movie.posterPath
        };

        this.cartService.addToCart(cartItem);

        this.snackBar.open('Film je uspešno dodat u korpu.', 'Zatvori', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }
}
