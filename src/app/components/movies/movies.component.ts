import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { AxiosError } from 'axios';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {RouterLink} from '@angular/router';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../loading/loading.component';
import { UtilityService } from '../../services/utility.service';
import { ErrorComponent } from '../error/error.component';
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-movies',
    imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        RouterLink,
        MatFormField,
        MatInput,
        MatLabel,
        MatProgressSpinnerModule,
        LoadingComponent,
        ErrorComponent,
        MatOption,
        MatPrefix,
        MatSelect,
        ReactiveFormsModule
    ],
    templateUrl: './movies.component.html',
    styleUrl: './movies.component.css',
    providers: [MovieService]
})
export class MoviesComponent implements OnInit
{
    private readonly movieService: MovieService = inject(MovieService);
    public readonly utilityService: UtilityService = inject(UtilityService);

    public movies: MovieModel[] | null = null;
    public error: string | null = null;

    async ngOnInit()
    {
        const [error, response] = await this.movieService.getMovies();

        if (error)
        {
            this.error = error.message;
        }
        else
        {
            this.movies = response.data.map((movie: any) => ({
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
        }
    }
}
