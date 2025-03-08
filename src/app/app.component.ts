import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatToolbar, MatButtonModule, RouterLink, MatIcon],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent
{
    title = 'veb-bioskop';
}
