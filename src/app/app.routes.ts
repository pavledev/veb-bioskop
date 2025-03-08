import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MoviesComponent } from './components/movies/movies.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'filmovi', component: MoviesComponent },
    { path: 'prijava', component: LoginComponent },
];
