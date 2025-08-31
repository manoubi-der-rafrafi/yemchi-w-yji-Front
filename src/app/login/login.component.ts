import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HeroLoginComponent } from '../hero-login/hero-login.component'; // si standalone
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeroLoginComponent , RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  showPass: boolean = false;

  constructor(
    private fb: FormBuilder ,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePass(): void {
    this.showPass = !this.showPass;
  }

  submit() {
    if (this.loginForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs.";
      return;
    }

    // Création de l'objet attendu par le backend
    const loginData = {
      email: this.loginForm.value.email,
      motDePasse: this.loginForm.value.password // <-- DOIT être motDePasse
    };
    
    this.authService.login(loginData).subscribe({
  next: (res: any) => {
    // 1) Token (tu l’avais déjà)
    this.authService.setToken(res.token);

    // 2) ENREGISTRER L’UTILISATEUR DANS localStorage
    //    -> adapte le nom selon ta réponse backend (user OU utilisateur)
    const user = res.user ?? res.utilisateur ?? null;

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // (optionnel) notifier le service si tu utilises un BehaviorSubject
      this.authService.setUser?.(user);
      // puis redirection
      this.router.navigate(['/']);
    } else {
      // Si ton backend ne renvoie pas l’objet user, on va le chercher via /me
      this.authService.getCurrentUser().subscribe({
        next: (u) => {
          localStorage.setItem('user', JSON.stringify(u));
          this.authService.setUser?.(u);
          this.router.navigate(['/']);
        },
        error: (e) => {
          console.error('[Login] /me a échoué :', e);
          this.router.navigate(['/']);
        }
      });
    }
  },
  error: () => {
    this.errorMessage = 'Email ou mot de passe incorrect.';
  }
});
  }

}
