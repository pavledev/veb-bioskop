import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MoviesComponent } from '../movies/movies.component';

@Component({
    selector: 'app-home',
    imports: [MatTabsModule, MatIconModule, MoviesComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    providers: []
})
export class HomeComponent
{
}
