import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nova-rota',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './nova-rota.component.html',
  styleUrl: './nova-rota.component.css'
})
export class NovaRotaComponent {
  origem: string = '';
  destino: string = '';
  data: string = '';

  constructor(private router: Router) {}

  voltarDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  criarRota(): void {
    if (!this.origem || !this.destino || !this.data) {
      alert('Preencha todos os campos.');
      return;
    }

    const novaRota = {
      origem: this.origem,
      destino: this.destino,
      data: this.data
    };

    console.log('Nova rota criada!', novaRota);
    
    // Aqui você poderia enviar `novaRota` para um backend futuramente.

    // Limpa os campos e redireciona
    this.router.navigate(['/dashboard']);
  }
}
