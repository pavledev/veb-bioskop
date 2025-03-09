import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { AxiosError } from 'axios';
import { MovieModel } from '../../models/movie.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-movie-details',
    imports: [],
    templateUrl: './movie-details.component.html',
    styleUrl: './movie-details.component.css',
    providers: [MovieService]
})
export class MovieDetailsComponent implements OnInit
{
    private route = inject(ActivatedRoute);
    public movie: MovieModel | null = null;
    public error: string | null = null;

    constructor(private movieService: MovieService)
    {
    }

    ngOnInit(): void
    {
        const movieSlug: string | null = this.route.snapshot.paramMap.get('slug');

        this.movieService
            .getMovieDetails(movieSlug)
            .then(response =>
            {
                this.movie = {
                    movieId: response.data.id,
                    imdbId: 0,
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
                    technologies: ["2D"],
                };
            })
            .catch((e: AxiosError) => this.error = `${e.code}: ${e.message}`);
    }
}
