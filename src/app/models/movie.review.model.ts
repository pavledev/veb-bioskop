export interface MovieReviewModel
{
    id: string;
    userId: string,
    movieId: string,
    title: string,
    content: string,
    rating: number,
    createdAt: string,
    updatedAt: string | null
}
