export interface MovieModel
{
    movieId: number;
    imdbId: number;
    title: string;
    originalTitle: string;
    description: string;
    startDate: string;
    duration: number;
    posterPath: string;
    trailerUrl: string;
    genres: string[];
    gallery: string[];
    actors: string[];
    directors: string[];
    technologies: string[];
}
