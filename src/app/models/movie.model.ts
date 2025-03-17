export interface MovieModel
{
    movieId: string;
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
    distributorName: string;
}
