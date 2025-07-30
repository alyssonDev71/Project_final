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
  currentTab = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  showPassword = signal<{[key: string]: boolean}>({});
  message = signal('');
  messageType = signal('');
  showTermsModal = signal(false);

  // Reactive Forms
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    userType: ['common', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, Validators.requiredTrue]
  }, { validators: this.passwordMatchValidator });

  // Validador customizado para confirmação de senha
  passwordMatchValidator(control: any) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      if (Object.keys(confirmPassword.errors || {}).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  // Alternar entre login e cadastro
  switchTab(tab: 'login' | 'register') {
    this.currentTab.set(tab);
    this.message.set('');
    this.resetForms();
  }

  // Reset dos formulários
  resetForms() {
    this.loginForm.reset({ rememberMe: false });
    this.registerForm.reset({ 
      userType: 'common',
      acceptTerms: false 
    });
    this.showPassword.set({});
  }

  // Alternar visibilidade da senha
  togglePasswordVisibility(fieldId: string) {
    this.showPassword.update(current => ({
      ...current,
      [fieldId]: !current[fieldId]
    }));
  }

  // Verificar se senha está visível
  isPasswordVisible(fieldId: string): boolean {
    return this.showPassword()[fieldId] || false;
  }

  // Abrir/fechar modal de termos
  openTermsModal() {
    this.showTermsModal.set(true);
  }

  closeTermsModal() {
    this.showTermsModal.set(false);
  }

  // Login
  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.message.set('');

      const formData = this.loginForm.value;
      
      try {
        await this.simulateLogin(formData);
        
        this.messageType.set('success');
        this.message.set('Login realizado com sucesso! Redirecionando...');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
        
      } catch (error) {
        this.messageType.set('error');
        this.message.set('Erro ao fazer login. Verifique suas credenciais.');
      } finally {
        this.isLoading.set(false);
        this.clearMessageAfterDelay();
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  // Cadastro
  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.message.set('');

      const formData = this.registerForm.value;
      const userTypeText = formData.userType === 'manager' ? 'Gestor' : 'Usuário Comum';
      
      try {
        await this.simulateRegister(formData);
        
        this.messageType.set('success');
        this.message.set(`Cadastro realizado com sucesso como ${userTypeText}!`);
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
        
      } catch (error) {
        this.messageType.set('error');
        this.message.set('Erro ao criar conta. Tente novamente.');
      } finally {
        this.isLoading.set(false);
        this.clearMessageAfterDelay();
      }
    } else {
      this.markFormGroupTouched(this.registerForm);
      
      if (!this.registerForm.get('acceptTerms')?.value) {
        this.messageType.set('error');
        this.message.set('É necessário aceitar os termos e condições para continuar.');
        this.clearMessageAfterDelay();
      }
    }
  }

  // Autenticação Google
  async onGoogleLogin() {
    // Para cadastro, verificar se os termos foram aceitos
    if (this.currentTab() === 'register') {
      if (!this.registerForm.get('acceptTerms')?.value) {
        this.messageType.set('error');
        this.message.set('É necessário aceitar os termos e condições para continuar.');
        this.registerForm.get('acceptTerms')?.markAsTouched();
        this.clearMessageAfterDelay();
        return;
      }
    }

    this.isLoading.set(true);
    const actionText = this.currentTab() === 'login' ? 'Conectando' : 'Cadastrando';
    this.message.set(`${actionText} com Google...`);
    this.messageType.set('');
    
    try {
      await this.simulateGoogleAuth();
      
      const successText = this.currentTab() === 'login' ? 'Autenticação' : 'Cadastro';
      this.messageType.set('success');
      this.message.set(`${successText} Google realizado com sucesso!`);
      
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
      
    } catch (error) {
      const errorText = this.currentTab() === 'login' ? 'autenticação' : 'cadastro';
      this.messageType.set('error');
      this.message.set(`Erro no ${errorText} Google. Tente novamente.`);
    } finally {
      this.isLoading.set(false);
      this.clearMessageAfterDelay();
    }
  }

  // Forgot password
  onForgotPassword(event: Event) {
    event.preventDefault();
    this.message.set('Funcionalidade "Esqueceu a senha" em desenvolvimento...');
    this.messageType.set('');
    this.clearMessageAfterDelay(3000);
  }

  // Helpers
  private markFormGroupTouched(formGroup: any) {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  private clearMessageAfterDelay(delay: number = 5000) {
    setTimeout(() => {
      this.message.set('');
    }, delay);
  }

  // Simulações de API
  private async simulateLogin(credentials: any): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          resolve();
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 1500);
    });
  }

  private async simulateRegister(userData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.name && userData.email && userData.password) {
          resolve();
        } else {
          reject(new Error('Dados inválidos'));
        }
      }, 1500);
    });
  }

  private async simulateGoogleAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula sucesso na maioria dos casos
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Erro Google Auth'));
        }
      }, 2000);
    });
  }

  // Getters para template
  get currentForm() {
    return this.currentTab() === 'login' ? this.loginForm : this.registerForm;
  }

  get isLoginTab() {
    return this.currentTab() === 'login';
  }

  get isRegisterTab() {
    return this.currentTab() === 'register';
  }
}