import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';

import { LoginComponent } from './login/login.component';
import { FormProduitAdminComponent } from './form-produit-admin/form-produit-admin.component';
import { PanierComponent } from './panier/panier.component';
import { ContactTransportComponent } from './contact-transport/contact-transport.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { HistoriqueClientComponent } from './historique-client/historique-client.component';
import { AmisListComponent } from './amis-list/amis-list.component';
export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  { path: 'AjoutProduit', component: FormProduitAdminComponent },
  { path: 'panier', component: PanierComponent },
  { path: 'contact', component: ContactTransportComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'profil/modifier', component: EditProfileComponent },
  { path: 'historique', component: HistoriqueClientComponent },
  { path: 'mesAmis', component: AmisListComponent },
];
