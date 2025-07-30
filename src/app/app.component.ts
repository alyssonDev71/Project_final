import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app">
      <app-navbar *ngIf="showNavbar"></app-navbar>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, NavbarComponent, CommonModule]
})
export class AppComponent {
  title = 'trajetus';

  constructor(private router: Router) {}

  get showNavbar(): boolean {
    // Esconde a navbar na página de login
    return !this.router.url.includes('/login');
  }
}