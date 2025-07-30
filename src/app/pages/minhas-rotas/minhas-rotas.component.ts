import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interfaces
interface Entrega {
  id: number;
  endereco: string;
  cliente: string;
  tempoEstimado: number;
  observacoes: string;
  status: 'pendente' | 'concluida';
  horaConclusao?: Date;
}

interface Parada {
  id: number;
  ordem: number;
  endereco: string;
  tempoEstimado: number;
  observacoes: string;
}

interface Rota {
  id: number;
  nome: string;
  descricao: string;
  data: Date;
  horaInicio: string;
  veiculo: string;
  pontoOrigem: string;
  pontoDestino: string;
  paradas: Parada[];
  entregas: Entrega[];
  status: 'ativa' | 'concluida' | 'pendente';
}

interface ProblemaForm {
  tipo: string;
  descricao: string;
  rotaId?: number;
}

@Component({
  selector: 'app-minhas-rotas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './minhas-rotas.component.html',
  styleUrls: ['./minhas-rotas.component.css']
})
export class MinhasRotasComponent {
  private router = inject(Router);

  // Signals renomeados internamente
  rotas = signal<Rota[]>([]);
  entregasVisiveis = signal<number[]>([]);
  private filtroStatusSignal = signal('todos');
  private filtroDataSignal = signal('todas');
  private termoBuscaSignal = signal('');
  message = signal('');
  messageType = signal('');
  showProblemaModal = signal(false);
  problemaForm = signal<ProblemaForm>({ tipo: '', descricao: '' });

  rotasFiltradas = computed(() => {
    let rotasFiltradas = this.rotas();

    if (this.filtroStatusSignal() !== 'todos') {
      rotasFiltradas = rotasFiltradas.filter(rota => rota.status === this.filtroStatusSignal());
    }

    if (this.filtroDataSignal() !== 'todas') {
      const hoje = new Date();
      const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      rotasFiltradas = rotasFiltradas.filter(rota => {
        const dataRota = new Date(rota.data);
        switch (this.filtroDataSignal()) {
          case 'hoje':
            return dataRota.toDateString() === new Date().toDateString();
          case 'semana':
            return dataRota >= inicioSemana;
          case 'mes':
            return dataRota >= inicioMes;
          default:
            return true;
        }
      });
    }

    if (this.termoBuscaSignal().trim()) {
      const termo = this.termoBuscaSignal().toLowerCase();
      rotasFiltradas = rotasFiltradas.filter(rota =>
        rota.nome.toLowerCase().includes(termo) ||
        rota.descricao.toLowerCase().includes(termo) ||
        rota.pontoOrigem.toLowerCase().includes(termo) ||
        rota.pontoDestino.toLowerCase().includes(termo)
      );
    }

    return rotasFiltradas;
  });

  totalEntregas = computed(() => {
    return this.rotas().reduce((total, rota) => total + rota.entregas.length, 0);
  });

  entregasConcluidas = computed(() => {
    return this.rotas().reduce((total, rota) => 
      total + rota.entregas.filter(entrega => entrega.status === 'concluida').length, 0
    );
  });

  entregasPendentes = computed(() => {
    return this.totalEntregas() - this.entregasConcluidas();
  });

  percentualConclusao = computed(() => {
    const total = this.totalEntregas();
    if (total === 0) return 0;
    return Math.round((this.entregasConcluidas() / total) * 100);
  });

  constructor() {
    this.carregarRotasMockadas();
  }

  private carregarRotasMockadas(): void {
    const rotasMockadas: Rota[] = [
      {
        id: 1,
        nome: 'Rota Centro - Zona Sul',
        descricao: 'Entrega de produtos para região central e zona sul',
        data: new Date(),
        horaInicio: '08:00',
        veiculo: 'Caminhão - ABC-1234',
        pontoOrigem: 'Centro de Distribuição - Rua A, 123',
        pontoDestino: 'Zona Sul - Terminal',
        paradas: [
          { id: 1, ordem: 1, endereco: 'Posto de Combustível - Km 15', tempoEstimado: 10, observacoes: 'Parada para abastecimento' }
        ],
        entregas: [
          { id: 1, endereco: 'Rua das Flores, 456', cliente: 'João Silva', tempoEstimado: 15, observacoes: 'Entregar no portão principal', status: 'pendente' },
          { id: 2, endereco: 'Av. Principal, 789', cliente: 'Maria Santos', tempoEstimado: 20, observacoes: '', status: 'concluida', horaConclusao: new Date() }
        ],
        status: 'ativa'
      },
      {
        id: 2,
        nome: 'Rota Norte - Leste',
        descricao: 'Entregas para zona norte e leste da cidade',
        data: new Date(Date.now() - 86400000), // Ontem
        horaInicio: '09:30',
        veiculo: 'Van - XYZ-5678',
        pontoOrigem: 'Depósito Norte - Rua B, 456',
        pontoDestino: 'Terminal Leste',
        paradas: [],
        entregas: [
          { id: 3, endereco: 'Rua do Comércio, 321', cliente: 'Pedro Oliveira', tempoEstimado: 25, observacoes: 'Cliente prefere receber pela manhã', status: 'concluida', horaConclusao: new Date(Date.now() - 3600000) },
          { id: 4, endereco: 'Av. dos Trabalhadores, 654', cliente: 'Ana Costa', tempoEstimado: 18, observacoes: '', status: 'concluida', horaConclusao: new Date(Date.now() - 7200000) }
        ],
        status: 'concluida'
      }
    ];

    this.rotas.set(rotasMockadas);
  }

  aplicarFiltros(): void {}

  atualizarRotas(): void {
    this.showMessage('Rotas atualizadas!', 'success');
    this.carregarRotasMockadas();
  }

  toggleEntregasVisibility(rotaId: number): void {
    this.entregasVisiveis.update(visiveis => 
      visiveis.includes(rotaId)
        ? visiveis.filter(id => id !== rotaId)
        : [...visiveis, rotaId]
    );
  }

  calcularProgressoRota(rota: Rota): number {
    if (rota.entregas.length === 0) return 0;
    const concluidas = rota.entregas.filter(e => e.status === 'concluida').length;
    return Math.round((concluidas / rota.entregas.length) * 100);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ativa': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  }

  toggleEntregaStatus(rotaId: number, entregaId: number): void {
    this.rotas.update(rotas => {
      return rotas.map(rota => {
        if (rota.id === rotaId) {
          const entregasAtualizadas = rota.entregas.map(entrega => {
            if (entrega.id === entregaId) {
              return entrega.status === 'pendente'
                ? { ...entrega, status: 'concluida' as const, horaConclusao: new Date() }
                : { ...entrega, status: 'pendente' as const, horaConclusao: undefined };
            }
            return entrega;
          });

          const todasConcluidas = entregasAtualizadas.every(e => e.status === 'concluida');
          const novoStatus = todasConcluidas ? 'concluida' : 'ativa';

          return { ...rota, entregas: entregasAtualizadas, status: novoStatus };
        }
        return rota;
      });
    });

    this.showMessage('Status da entrega atualizado!', 'success');
  }

  todasEntregasConcluidas(rota: Rota): boolean {
    return rota.entregas.length > 0 && rota.entregas.every(e => e.status === 'concluida');
  }

  concluirTodasEntregas(rotaId: number): void {
    if (confirm('Tem certeza que deseja marcar todas as entregas como concluídas?')) {
      this.rotas.update(rotas => {
        return rotas.map(rota => {
          if (rota.id === rotaId) {
            const entregasAtualizadas = rota.entregas.map(entrega => ({
              ...entrega,
              status: 'concluida' as const,
              horaConclusao: entrega.status === 'pendente' ? new Date() : entrega.horaConclusao
            }));

            return { ...rota, entregas: entregasAtualizadas, status: 'concluida' as const };
          }
          return rota;
        });
      });

      this.showMessage('Todas as entregas foram marcadas como concluídas!', 'success');
    }
  }

  marcarProblemaRota(rotaId: number): void {
    this.showProblemaModal.set(true);
    this.problemaForm.update(form => ({ ...form, rotaId }));
  }

  closeProblemaModal(): void {
    this.showProblemaModal.set(false);
    this.problemaForm.set({ tipo: '', descricao: '' });
  }

  enviarProblema(): void {
    const form = this.problemaForm();
    if (!form.tipo || !form.descricao.trim()) {
      this.showMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }

    console.log('Problema reportado:', form);

    this.closeProblemaModal();
    this.showMessage('Problema reportado com sucesso! Nossa equipe será notificada.', 'success');
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set(text);
    this.messageType.set(type);

    setTimeout(() => {
      this.message.set('');
    }, 3000);
  }

  // Getters e Setters compatíveis com o template
  get filtroStatus() {
    return this.filtroStatusSignal();
  }

  set filtroStatus(value: string) {
    this.filtroStatusSignal.set(value);
  }

  get filtroData() {
    return this.filtroDataSignal();
  }

  set filtroData(value: string) {
    this.filtroDataSignal.set(value);
  }

  get termoBusca() {
    return this.termoBuscaSignal();
  }

  set termoBusca(value: string) {
    this.termoBuscaSignal.set(value);
  }

  // Getters e Setters para o formulário de problema
  get problemaFormTipo() {
    return this.problemaForm().tipo;
  }

  set problemaFormTipo(value: string) {
    this.problemaForm.update(form => ({ ...form, tipo: value }));
  }

  get problemaFormDescricao() {
    return this.problemaForm().descricao;
  }

  set problemaFormDescricao(value: string) {
    this.problemaForm.update(form => ({ ...form, descricao: value }));
  }
}