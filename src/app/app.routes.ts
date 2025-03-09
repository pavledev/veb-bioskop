import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MoviesComponent } from './components/movies/movies.component';
import { RegisterComponent } from './components/register/register.component';
import {MovieDetailsComponent} from './components/movie-details/movie-details.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'filmovi', component: MoviesComponent },
    { path: 'filmovi/:slug', component: MovieDetailsComponent },
    { path: 'prijava', component: LoginComponent },
    { path: 'registracija', component: RegisterComponent },
];
