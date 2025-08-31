import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule , AbstractControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HeroLoginComponent } from '../hero-login/hero-login.component'; 
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,HeroLoginComponent ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  signUpForm: FormGroup;
  errorMessage: string = '';
  showPass: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService ,  private router: Router) 
  {
    this.signUpForm = this.fb.group({
      nom: ['',[Validators.required,Validators.pattern(/^[A-Za-zÀ-ÿ '-]+$/)]],
      prenom: ['',[Validators.required,Validators.pattern(/^[A-Za-zÀ-ÿ '-]+$/)]],
      date_naissance: ['', Validators.required],
      telephone: ['',[Validators.required,Validators.pattern(/^\d{8}$/)]],
      adresse: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator })
  }

  togglePass(): void {
    this.showPass = !this.showPass;
  }
  passwordsMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      return null;
    }
  }
  onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const data = {
    nom: this.signUpForm.value.nom,
    prenom: this.signUpForm.value.prenom,
    email: this.signUpForm.value.email,
    motDePasse: this.signUpForm.value.password,
    adresse: this.signUpForm.value.adresse,
    telephone: this.signUpForm.value.telephone,
    date_naissance: this.signUpForm.value.date_naissance,
    statut: 'actif',
    role: 'client'
  };
  console.log('Données envoyées à l\'API :', data);
    this.authService.register(data).subscribe({
      next: (response) => {
        alert('Inscription réussie !');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        // Affiche l’erreur
        alert('Erreur lors de l\'inscription : ' + err.error.message);
      }
    });
   }
  
}
