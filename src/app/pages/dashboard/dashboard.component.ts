import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  
  constructor(private router: Router) {}

  userName: string = 'Gestor';

  dashboardStats = [
    { icon: '🚛', value: '127', label: 'Rotas Ativas' },
    { icon: '📦', value: '2.847', label: 'Entregas Hoje' },
    { icon: '⚡', value: '94%', label: 'Eficiência' },
    { icon: '💰', value: 'R$ 45.2k', label: 'Economia Mensal' }
  ];

  tripsInProgress = [
    {
      imagePlaceholder: '🚚',
      date: 'Hoje',
      title: 'São Paulo → Santos',
      description: 'Via Imigrantes - 15 paradas programadas',
      details: ['120 km', '3h estimadas'],
      status: 'Em Trânsito',
      statusClass: 'status-confirmado'
    },
    {
      imagePlaceholder: '🚛',
      date: 'Amanhã',
      title: 'Curitiba → Joinville',
      description: 'BR-101 - 8 paradas programadas',
      details: ['180 km', '4h estimadas'],
      status: 'Aguardando',
      statusClass: 'status-pendente'
    },
    {
      imagePlaceholder: '🚐',
      date: '15/Jan',
      title: 'Recife → Fortaleza',
      description: 'BR-116 - 22 paradas programadas',
      details: ['500 km', '8h estimadas'],
      status: 'Planejada',
      statusClass: 'status-pendente'
    }
  ];

  optimizationsSuggested = [
    {
      imagePlaceholder: '⚡',
      score: '85% economia',
      title: 'Rota Consolidada SP',
      description: 'Combine 3 rotas da zona oeste em uma única viagem otimizada',
      economy: 'R$ 1.200/dia'
    },
    {
      imagePlaceholder: '🔄',
      score: '72% eficiência',
      title: 'Redistribuição de Carga',
      description: 'Rebalanceie cargas entre centros de distribuição para reduzir distâncias',
      economy: 'R$ 890/dia'
    }
  ];

  deliveryHistory = [
    {
      imagePlaceholder: '✅',
      title: 'São Paulo → Campinas',
      details: '18/01/2025 • 2h 15min • Via Anhanguera',
      deliveries: '12 entregas realizadas com sucesso',
      rating: 5,
      ratingText: '100% entregue'
    },
    {
      imagePlaceholder: '✅',
      title: 'Curitiba → Maringá',
      details: '17/01/2025 • 3h 45min • BR-376',
      deliveries: '18 entregas realizadas - 2 reagendadas',
      rating: 4,
      ratingText: '89% entregue'
    },
    {
      imagePlaceholder: '✅',
      title: 'Recife → João Pessoa',
      details: '16/01/2025 • 1h 50min • BR-230',
      deliveries: '8 entregas realizadas com sucesso',
      rating: 5,
      ratingText: '100% entregue'
    }
  ];

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Navegação para nova rota (perfil Gestor)
  createNewRoute(): void {
    this.router.navigate(['/nova-rota']);
  }

  // Navegação para minhas rotas (perfil Usuário Comum)
  viewMyRoutes(): void {
    this.router.navigate(['/minhas-rotas']);
  }

  viewDetails(): void {
    console.log('View details button clicked!');
    alert('Funcionalidade "Ver Detalhes" ainda não implementada.');
  }

  // Método para simular diferentes perfis de usuário
  switchUserProfile(profile: 'gestor' | 'usuario'): void {
    this.userName = profile === 'gestor' ? 'Gestor' : 'Usuário';
    
    if (profile === 'usuario') {
      // Redirecionar usuário comum para suas rotas
      this.router.navigate(['/minhas-rotas']);
    }
  }

  // Método para demonstrar funcionalidades baseadas no perfil
  getUserActions() {
    return this.userName === 'Gestor' 
      ? [
          { label: 'Nova Rota', action: () => this.createNewRoute(), icon: '➕' },
          { label: 'Gerenciar Usuários', action: () => this.viewDetails(), icon: '👥' },
          { label: 'Relatórios', action: () => this.viewDetails(), icon: '📊' }
        ]
      : [
          { label: 'Minhas Rotas', action: () => this.viewMyRoutes(), icon: '📋' },
          { label: 'Histórico', action: () => this.viewDetails(), icon: '📜' },
          { label: 'Perfil', action: () => this.viewDetails(), icon: '👤' }
        ];
  }
}
