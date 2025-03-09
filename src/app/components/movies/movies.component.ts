import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { MovieModel } from '../../models/movie.model';
import { AxiosError } from 'axios';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-movies',
    imports: [
        NgForOf,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        RouterLink
    ],
    templateUrl: './movies.component.html',
    styleUrl: './movies.component.css',
    providers: [MovieService]
})
export class MoviesComponent implements OnInit
{
    public movies: MovieModel[] | null = null;
    public error: string | null = null;

    constructor(private movieService: MovieService)
    {
    }

    ngOnInit(): void
    {
        this.movieService
            .getMovies()
            .then(response =>
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
                }));
            })
            .catch((e: AxiosError) => this.error = `${e.code}: ${e.message}`);
    }

    getSlug(title: string): string
    {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
