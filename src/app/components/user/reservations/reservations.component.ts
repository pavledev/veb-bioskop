import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ReservationModel } from '../../../models/reservation.model';
import { ReservationService } from '../../../services/reservation.service';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-reservations',
    templateUrl: './reservations.component.html',
    imports: [
        MatFormField,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
    styleUrls: ['./reservations.component.scss'],
    providers: [ReservationService]
})
export class ReservationsComponent implements OnInit
{
    displayedColumns: string[] = ['id', 'title', 'price', 'totalPrice', 'ticketCount', 'date', 'time', 'hall', 'technology', 'status'];
    reservations = new MatTableDataSource<ReservationModel>([]);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private reservationService: ReservationService)
    {
    }

    async ngOnInit(): Promise<void>
    {
        this.reservationService.getAllReservations().subscribe(
            (data) =>
            {
                console.log('Učitan broj rezervacija:', data.length);
                console.log('Rezervacije:', data);
                this.reservations.data = data;
                this.reservations.paginator = this.paginator;
                this.reservations.sort = this.sort;
            },
            (error) =>
            {
                console.error('Greška prilikom učitavanja rezervacija:', error);
            }
        );
    }

    applyFilter(event: Event)
    {
        const filterValue = (event.target as HTMLInputElement).value;
        this.reservations.filter = filterValue.trim().toLowerCase();
    }
}
