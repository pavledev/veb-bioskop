import { Routes } from '@angular/router';
import {
    canActivate,
    redirectLoggedInTo,
    redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MoviesComponent } from './components/movies/movies.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { CartComponent } from './components/cart/cart.component';
import { ReservationsComponent } from './components/user/reservations/reservations.component';

const redirectLoggedInToHome = () => redirectLoggedInTo(['/']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['prijava']);

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'filmovi', component: MoviesComponent },
    { path: 'filmovi/:slug', component: MovieDetailsComponent },
    { path: 'korpa', component: CartComponent },
    { path: 'prijava', component: LoginComponent, ...canActivate(redirectLoggedInToHome) },
    { path: 'registracija', component: RegisterComponent, ...canActivate(redirectLoggedInToHome) },
    { path: 'profil', component: ProfileComponent, ...canActivate(redirectUnauthorizedToLogin) },
    { path: 'rezervacije', component: ReservationsComponent, ...canActivate(redirectUnauthorizedToLogin) }
];
