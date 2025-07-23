import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals para estado reativo
  isLoading = signal(false);
  showPassword = signal(false);
  message = signal('');
  messageType = signal('');
  showTermsModal = signal(false);

  // Reactive Form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
    acceptTerms: [false, Validators.requiredTrue] // Novo campo obrigatório para termos
  });

  togglePasswordVisibility() {
    this.showPassword.update(show => !show);
  }

  // Método para abrir modal de termos
  openTermsModal() {
    this.showTermsModal.set(true);
  }

  // Método para fechar modal de termos
  closeTermsModal() {
    this.showTermsModal.set(false);
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.message.set('');

      const formData = this.loginForm.value;
      
      try {
        // Simula chamada para API
        await this.simulateLogin(formData);
        
        this.messageType.set('success');
        this.message.set('Login realizado com sucesso! Redirecionando...');
        
        // Simula redirecionamento
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
        
      } catch (error) {
        this.messageType.set('error');
        this.message.set('Erro ao fazer login. Verifique suas credenciais.');
      } finally {
        this.isLoading.set(false);
        
        // Limpa mensagem após 5 segundos
        setTimeout(() => {
          this.message.set('');
        }, 5000);
      }
    } else {
      // Marca todos os campos como touched para mostrar erros
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });

      // Verifica especificamente se os termos não foram aceitos
      if (!this.loginForm.get('acceptTerms')?.value) {
        this.messageType.set('error');
        this.message.set('É necessário aceitar os termos e condições para continuar.');
        
        setTimeout(() => {
          this.message.set('');
        }, 5000);
      }
    }
  }

  async onGoogleLogin() {
    // Verifica se os termos foram aceitos antes de prosseguir
    if (!this.loginForm.get('acceptTerms')?.value) {
      this.messageType.set('error');
      this.message.set('É necessário aceitar os termos e condições para continuar.');
      
      setTimeout(() => {
        this.message.set('');
      }, 5000);
      return;
    }

    this.isLoading.set(true);
    this.message.set('Conectando com Google...');
    this.messageType.set('');
    
    try {
      // Simula autenticação Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.messageType.set('success');
      this.message.set('Autenticação Google realizada com sucesso!');
      
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
      
    } catch (error) {
      this.messageType.set('error');
      this.message.set('Erro na autenticação Google. Tente novamente.');
    } finally {
      this.isLoading.set(false);
      
      setTimeout(() => {
        this.message.set('');
      }, 5000);
    }
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    this.message.set('Funcionalidade "Esqueceu a senha" em desenvolvimento...');
    this.messageType.set('');
    
    setTimeout(() => {
      this.message.set('');
    }, 3000);
  }

  onSignUp(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  private async simulateLogin(credentials: any): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula validação de credenciais
        if (credentials.email && credentials.password) {
          resolve();
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 1500);
    });
  }
}
