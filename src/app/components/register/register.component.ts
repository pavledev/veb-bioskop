import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatPrefix } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenreService } from '../../services/genre.service';
import { AxiosError } from 'axios';

@Component({
    selector: 'app-register',
    imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        RouterLink,
        MatPrefix,
        ReactiveFormsModule
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    providers: [GenreService]
})
export class RegisterComponent implements OnInit
{
    genres: string[] | null = null;
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);

    constructor(private genreService: GenreService)
    {
    }

    ngOnInit(): void
    {
        this.genreService.getGenres()
            .then(genres =>
            {
                this.genres = genres;

                /*// Inicijalizacija forme nakon što se podaci učitaju
                this.registrationForm = this.fb.group({
                    genres: this.fb.array(this.genres.map(() => false))
                });*/
                console.log(this.genres);
            })
            .catch(error => console.error("Greška pri učitavanju žanrova:", error));
    }
}
