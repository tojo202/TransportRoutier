import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  roles = [
    { id: 'admin', label: 'ADMIN', icon: 'shield' },
    { id: 'agent', label: 'AGENT', icon: 'support_agent' },
    { id: 'driver', label: 'CHAUFFEUR', icon: 'directions_bus' },
    { id: 'client', label: 'CLIENT', icon: 'person' }
  ];
  selectedRole = 'admin';
  email = 'admin@transport.com';
  password = 'Admin123!';
  rememberMe = false;
  isLoading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  selectRole(roleId: string) {
    this.selectedRole = roleId;
    this.fillDemo(roleId as any);
  }

  fillDemo(role: 'admin' | 'agent' | 'driver' | 'client') {
    const demos: Record<string, { email: string; password: string }> = {
      'admin': { email: 'admin@transport.com', password: 'Admin123!' },
      'agent': { email: 'agent@transport.com', password: 'Agent123!' },
      'driver': { email: 'driver@transport.com', password: 'Driver123!' },
      'client': { email: 'client@transport.com', password: 'Client123!' }
    };
    
    if (demos[role]) {
      this.email = demos[role].email;
      this.password = demos[role].password;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res.user?.role || this.selectedRole;
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (role === 'agent') {
          this.router.navigate(['/reservations']);
        } else if (role === 'driver') {
          this.router.navigate(['/driver-trips']);
        } else {
          this.router.navigate(['/platform']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 422) {
          this.error = 'Identifiants invalides';
        } else {
          this.error = 'Erreur de connexion au serveur';
        }
      }
    });
  }
}
