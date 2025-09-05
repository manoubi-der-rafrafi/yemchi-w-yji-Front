import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule , Validators} from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { ProduitService } from '../services/produit.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommandeService } from '../services/commande.service';
import { Produit } from '../models/produit.model';
import { Commande } from '../models/commande.model';
import { Utilisateur } from '../models/utilisateur.model';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-form-produit-admin',
  standalone: true,
  imports: [ReactiveFormsModule , NgIf , NgForOf],
  templateUrl: './form-produit-admin.component.html',
  styleUrl: './form-produit-admin.component.css'
})
export class FormProduitAdminComponent {



  
  submitted = false;
  produitForm!: FormGroup;
  type: string = '';
  
  mobiliers = ['Table', 'Chaise', 'Bureau', 'Armoire'];
  electromenagers = ['Frigo', 'Lave-linge', 'Four', 'Micro-ondes'];

  constructor(private authService: AuthService,private commandeService: CommandeService , private fb: FormBuilder,private produitService : ProduitService , private router: Router) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }
  this.produitForm = this.fb.group({
    type: ['', Validators.required],
    nom: ['', Validators.required],
    hauteur: [''],
    largeur: [''],
    profondeur: [''],
    matiere: [''],
    aideTransport: [''],
    demontable: [false, Validators.required],
    detailDemontage: [''],
    fragile: [false, Validators.required], // booléen
    fragileDetail: [''],
    quantite: [1, [Validators.required, Validators.min(1)]],
    prixUnitaire: [''],
    image1: ['', Validators.required],
    image2: [null],
    image3: [null] 
  });

  // 🎯 Règle 1 : champs obligatoires si type = mobilier ou électroménager
  this.produitForm.get('type')?.valueChanges.subscribe((value) => {
    const champsObligatoires = ['hauteur', 'largeur', 'profondeur', 'matiere', 'image2', 'image3'];

    if (value && (value.toLowerCase() === 'mobilier' || value.toLowerCase() === 'électroménager')) {
      champsObligatoires.forEach(champ => {
        this.produitForm.get(champ)?.setValidators(Validators.required);
        this.produitForm.get(champ)?.updateValueAndValidity();
      });
    } else {
      champsObligatoires.forEach(champ => {
        this.produitForm.get(champ)?.clearValidators();
        this.produitForm.get(champ)?.updateValueAndValidity();
      });
    }
  });

  // 🎯 Règle 2 : fragileDetail obligatoire si fragile = true
  this.produitForm.get('fragile')?.valueChanges.subscribe((isFragile) => {
    if (isFragile === true || isFragile === 'true') {
      this.produitForm.get('fragileDetail')?.setValidators(Validators.required);
    } else {
      this.produitForm.get('fragileDetail')?.clearValidators();
    }
    this.produitForm.get('fragileDetail')?.updateValueAndValidity();
  });
}



// Pour tester la validité
onSubmit() {
  if (this.produitForm.invalid) {
    this.produitForm.markAllAsTouched();
    return;
  }
  console.log('Formulaire valide ✅', this.produitForm.value);
  const v = this.produitForm.value;
  const fd = new FormData();

  // champs texte / nombres / booléens (FormData attend des strings ou des blobs)
  [
    'type','nom','hauteur','largeur','profondeur','matiere',
    'aideTransport','demontable','detailDemontage','fragile',
    'fragileDetail','quantite','prixUnitaire'
  ].forEach(k => fd.append(k, v[k] != null ? String(v[k]) : ''));

  // fichiers
  const img1: File | null = this.produitForm.get('image1')?.value;
  const img2: File | null = this.produitForm.get('image2')?.value;
  const img3: File | null = this.produitForm.get('image3')?.value;
  if (img1) fd.append('image1', img1, img1.name);
  if (img2) fd.append('image2', img2, img2.name);
  if (img3) fd.append('image3', img3, img3.name);
  this.produitService.create(fd).subscribe({
    next: (p) => console.log('Créé ✅', p),
    error: (e) => console.error('Erreur ❌', e)
  });
  
}

  onTypeChange(): void {
    this.type = this.produitForm.value.type;
  }




  

  get f() {
    return this.produitForm.controls;
  }

  // Utilitaire pour afficher une erreur proprement
  has(controlName: string, error: string) {
    const ctrl = this.f[controlName];
    return ctrl?.hasError(error) && (ctrl.touched || this.submitted);
  }

  message: string = '';
messageType: 'success' | 'error' | '' = '';


  






  image1: File | null = null;
  image2: File | null = null;
  image3: File | null = null;

  onImageSelected(e: Event) {
    
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.image1 = file;
    // Ne pas patchValue ici !
    this.produitForm.get('image1')?.markAsDirty();
    this.produitForm.get('image1')?.updateValueAndValidity({ onlySelf: true });
  }

  onImageSelected2(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.image2 = file;
    this.produitForm.get('image2')?.markAsDirty();
    this.produitForm.get('image2')?.updateValueAndValidity({ onlySelf: true });
  }
  onImageSelected3(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  this.image3 = file;
  this.produitForm.get('image3')?.markAsDirty();
  this.produitForm.get('image3')?.updateValueAndValidity({ onlySelf: true });
}

role: string | null = null;
  commande: Commande | null = null;
  produits: Produit[] = [];
  utilisateur : Utilisateur | null = null ;



  async ajouterProduit(): Promise<void> {
     this.submitted = true;
  if (this.produitForm.invalid) { this.produitForm.markAllAsTouched(); return; }

  if (this.image1) {
    try {
      const res = await firstValueFrom(this.produitService.uploadProduitImage(this.image1));
      // injecte l’URL dans le formulaire
      console.log("path recuperer" + res.url);
      this.produitForm.value.image1 = res.url ;
      console.log(this.produitForm.value.image1 + res.url);
    } catch (err:any) {
      alert(`Erreur upload1: ${err?.error?.message ?? 'voir console'}`);
      return;
    }
  }
  if (this.image2) {
    try {
      const res = await firstValueFrom(this.produitService.uploadProduitImage(this.image2));
      // injecte l’URL dans le formulaire
      console.log("path recuperer" + res.url);
      this.produitForm.value.image2 = res.url ;
      console.log(this.produitForm.value.image2 + res.url);
    } catch (err:any) {
      alert(`Erreur upload2: ${err?.error?.message ?? 'voir console'}`);
      return;
    }
  }
  if (this.image3) {
    try {
      const res = await firstValueFrom(this.produitService.uploadProduitImage(this.image3));
      // injecte l’URL dans le formulaire
      console.log("path recuperer" + res.url);
      this.produitForm.value.image3 = res.url ;
      console.log(this.produitForm.value.image3 + res.url);
    } catch (err:any) {
      alert(`Erreur upload3: ${err?.error?.message ?? 'voir console'}`);
      return;
    }
  }
// Construire le payload
let payload: any = { ...this.produitForm.value };

// ⚠️ Ici tu adaptes au backend
payload.image = payload.image1Url;  
// payload.imagePath = payload.image1Url; // si c’est "imagePath"
// payload.image1 = payload.image1Url;    // si c’est "image1"

delete payload.image1Url; // facultatif : éviter de polluer

console.log("Payload envoyé:", payload);

    // Récupérer l'utilisateur depuis le localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.utilisateur = JSON.parse(userString) as Utilisateur;
        console.log("Utilisateur récupéré :", this.utilisateur);
      } catch (e) {
        console.error('Erreur parsing utilisateur:', e);
      }
    } else {
      console.warn("Aucun utilisateur trouvé dans le localStorage");
    }

    // Vérifier si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      this.role = this.authService.getRole();
      console.log('Rôle : ' + this.role);

      // ID utilisateur depuis l'objet utilisateur
      const userId = this.utilisateur?.id ?? 0;

      // Récupérer la commande en cours
      this.commandeService.getCommandeEnCoursByClient(userId).subscribe({
        next: (commande) => {
          this.commande = commande;
          console.log('Commande en cours:', commande);

          payload.commande = { id: commande.id };
          // Créer le produit
          this.produitService.create(payload).subscribe({
            next: () => {
              this.router.navigate(['/panier']);
            },
            error: (err) => {
              console.error('Erreur création produit:', err);
              alert('Erreur lors de la création du produit.');
            }
          });
        },
        error: () => {
          console.error('Aucune commande en cours trouvée !');
        }
      });
    }
  }

}
