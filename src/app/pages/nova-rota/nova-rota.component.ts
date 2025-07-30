import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interface para as paradas
interface Parada {
  id: number;
  ordem: number;
  endereco: string;
  tempoEstimado: number;
  observacoes: string;
  posicao: { x: number; y: number };
}

// Interface para a rota
interface NovaRota {
  nome: string;
  data: string;
  horaInicio: string;
  veiculo: string;
  descricao: string;
  pontoOrigem: string;
  pontoDestino: string;
  paradas: Parada[];
}

@Component({
  selector: 'app-nova-rota',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './nova-rota.component.html',
  styleUrls: ['./nova-rota.component.css']
})
export class NovaRotaComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals para estado reativo
  isLoading = signal(false);
  message = signal('');
  messageType = signal('');
  paradas = signal<Parada[]>([]);
  paradasMapa = signal<Parada[]>([]);

  // Contador para IDs únicos das paradas
  private proximoIdParada = 1;

  // Posições fixas para simulação do mapa
  pontoOrigemPosicao = { x: 15, y: 20 };
  pontoDestinoPosicao = { x: 85, y: 80 };

  // Reactive Form
  novaRotaForm = this.fb.group({
    nome: ['', [Validators.required]],
    data: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    veiculo: ['', [Validators.required]],
    descricao: [''],
    pontoOrigem: ['', [Validators.required]],
    pontoDestino: ['', [Validators.required]]
  });

  constructor() {
    // Definir data padrão como hoje
    const hoje = new Date().toISOString().split('T')[0];
    this.novaRotaForm.patchValue({ data: hoje });
  }

  // Adicionar nova parada
  adicionarParada(): void {
    const novaParada: Parada = {
      id: this.proximoIdParada++,
      ordem: this.paradas().length + 1,
      endereco: '',
      tempoEstimado: 15,
      observacoes: '',
      posicao: this.gerarPosicaoAleatoria()
    };

    this.paradas.update(paradas => [...paradas, novaParada]);
    this.atualizarParadasMapa();
  }

  // Remover parada
  removerParada(id: number): void {
    this.paradas.update(paradas => {
      const novasParadas = paradas.filter(p => p.id !== id);
      // Reordenar as paradas
      return novasParadas.map((parada, index) => ({
        ...parada,
        ordem: index + 1
      }));
    });
    this.atualizarParadasMapa();
  }

  // Atualizar paradas no mapa
  private atualizarParadasMapa(): void {
    this.paradasMapa.set([...this.paradas()]);
  }

  // Gerar posição aleatória para paradas no mapa
  private gerarPosicaoAleatoria(): { x: number; y: number } {
    return {
      x: Math.random() * 60 + 20, // Entre 20% e 80%
      y: Math.random() * 60 + 20  // Entre 20% e 80%
    };
  }

  // Calcular distância total simulada
  distanciaTotal(): string {
    const baseDistance = 50;
    const paradasDistance = this.paradas().length * 15;
    const total = baseDistance + paradasDistance + Math.random() * 20;
    return total.toFixed(1);
  }

  // Calcular tempo total simulado
  tempoTotal(): string {
    const baseTime = 120; // minutos
    const paradasTime = this.paradas().reduce((total, parada) => total + parada.tempoEstimado, 0);
    const totalMinutes = baseTime + paradasTime + Math.random() * 30;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  // Gerar path SVG para a linha da rota
  rotaPath(): string {
    if (this.paradas().length === 0) {
      return `M ${this.pontoOrigemPosicao.x} ${this.pontoOrigemPosicao.y} L ${this.pontoDestinoPosicao.x} ${this.pontoDestinoPosicao.y}`;
    }

    let path = `M ${this.pontoOrigemPosicao.x} ${this.pontoOrigemPosicao.y}`;
    
    this.paradas().forEach(parada => {
      path += ` L ${parada.posicao.x} ${parada.posicao.y}`;
    });
    
    path += ` L ${this.pontoDestinoPosicao.x} ${this.pontoDestinoPosicao.y}`;
    
    return path;
  }

  // Centralizar mapa (simulação)
  centralizarMapa(): void {
    this.showMessage('Mapa centralizado!', 'success');
  }

  // Otimizar rota (simulação)
  otimizarRota(): void {
    if (this.paradas().length === 0) {
      this.showMessage('Adicione paradas para otimizar a rota.', 'error');
      return;
    }

    // Simular otimização reorganizando as paradas
    this.paradas.update(paradas => {
      const paradasOtimizadas = [...paradas].sort(() => Math.random() - 0.5);
      return paradasOtimizadas.map((parada, index) => ({
        ...parada,
        ordem: index + 1,
        posicao: this.gerarPosicaoAleatoria()
      }));
    });

    this.atualizarParadasMapa();
    this.showMessage('Rota otimizada com sucesso!', 'success');
  }

  // Salvar rota
  async salvarRota(): Promise<void> {
    if (this.novaRotaForm.valid) {
      this.isLoading.set(true);
      this.message.set('');

      const formData = this.novaRotaForm.value;
      const novaRota: NovaRota = {
        nome: formData.nome || '',
        data: formData.data || '',
        horaInicio: formData.horaInicio || '',
        veiculo: formData.veiculo || '',
        descricao: formData.descricao || '',
        pontoOrigem: formData.pontoOrigem || '',
        pontoDestino: formData.pontoDestino || '',
        paradas: this.paradas()
      };

      try {
        await this.simularSalvarRota(novaRota);
        
        this.showMessage('Rota criada com sucesso! Redirecionando...', 'success');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        
      } catch (error) {
        this.showMessage('Erro ao criar rota. Tente novamente.', 'error');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
      this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
    }
  }

  // Cancelar criação
  cancelarCriacao(): void {
    if (this.novaRotaForm.dirty || this.paradas().length > 0) {
      if (confirm('Tem certeza que deseja cancelar? Todas as informações serão perdidas.')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Simular salvamento da rota
  private async simularSalvarRota(rota: NovaRota): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (rota.nome && rota.pontoOrigem && rota.pontoDestino) {
          console.log('Rota salva:', rota);
          resolve();
        } else {
          reject(new Error('Dados inválidos'));
        }
      }, 1500);
    });
  }

  // Marcar todos os campos como touched para mostrar erros
  private markFormGroupTouched(): void {
    Object.keys(this.novaRotaForm.controls).forEach(key => {
      this.novaRotaForm.get(key)?.markAsTouched();
    });
  }

  // Mostrar mensagem
  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set(text);
    this.messageType.set(type);
    
    setTimeout(() => {
      this.message.set('');
    }, 3000);
  }
}

