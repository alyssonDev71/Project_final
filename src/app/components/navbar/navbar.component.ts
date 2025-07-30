import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
})
export class NavbarComponent {
  private router = inject(Router);

  // Signals para estado reativo
  userName = signal('João Silva');
  userRole = signal('Gestor');
  private selectedProfileSignal = signal('gestor'); // renomeado aqui
  isLoggedIn = signal(false);
  showProfileMenu = signal(false);

  constructor() {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    const currentRoute = this.router.url;
    this.isLoggedIn.set(currentRoute !== '/login' && currentRoute !== '/');

    if (this.isLoggedIn()) {
      this.updateUserRole();
    }
  }

  switchProfile(profile: string): void {
    this.selectedProfile = profile;
    this.updateUserRole();

    if (profile === 'usuario') {
      this.router.navigate(['/minhas-rotas']);
    } else {
      this.router.navigate(['/dashboard']);
    }

    this.showProfileMenu.set(false);
  }

  private updateUserRole(): void {
    const profile = this.selectedProfile;
    this.userRole.set(profile === 'gestor' ? 'Gestor' : 'Usuário Comum');
  }

  toggleProfileMenu(): void {
    this.showProfileMenu.update(show => !show);
  }

  closeProfileMenu(): void {
    this.showProfileMenu.set(false);
  }

  navigateToProfileFeature(feature: string): void {
    const currentProfile = this.selectedProfile;

    switch (feature) {
      case 'nova-rota':
        if (currentProfile === 'gestor') {
          this.router.navigate(['/nova-rota']);
        }
        break;
      case 'minhas-rotas':
        if (currentProfile === 'usuario') {
          this.router.navigate(['/minhas-rotas']);
        }
        break;
      case 'relatorios':
        alert('Funcionalidade "Relatórios" em desenvolvimento.');
        break;
      case 'configuracoes':
        alert('Funcionalidade "Configurações" em desenvolvimento.');
        break;
    }

    this.closeProfileMenu();
  }

  logout(): void {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      this.isLoggedIn.set(false);
      this.selectedProfile = 'gestor';
      this.updateUserRole();
      this.router.navigate(['/login']);
    }

    this.closeProfileMenu();
  }

  getProfileNavLinks() {
    const currentProfile = this.selectedProfile;

    if (currentProfile === 'gestor') {
      return [
        {
          label: 'Nova Rota',
          route: '/nova-rota',
          icon: '🗺️',
          action: () => this.navigateToProfileFeature('nova-rota')
        },
        {
          label: 'Relatórios',
          route: '#',
          icon: '📊',
          action: () => this.navigateToProfileFeature('relatorios')
        }
      ];
    } else {
      return [
        {
          label: 'Minhas Rotas',
          route: '/minhas-rotas',
          icon: '📋',
          action: () => this.navigateToProfileFeature('minhas-rotas')
        },
        {
          label: 'Histórico',
          route: '#',
          icon: '📜',
          action: () => this.navigateToProfileFeature('historico')
        }
      ];
    }
  }

  // Getters e Setters para template
  get selectedProfile() {
    return this.selectedProfileSignal();
  }

  set selectedProfile(value: string) {
    this.selectedProfileSignal.set(value);
  }
}