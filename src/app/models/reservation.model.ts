export interface ReservationModel
{
    id: string;
    userId: string;
    movieId: string;
    title: string;
    price: number;
    totalPrice: number;
    ticketCount: number;
    date: string;
    time: string;
    hall: string;
    technology: string;
    status: 'Rezervisano' | 'Gledano' | 'Otkazano';
}
