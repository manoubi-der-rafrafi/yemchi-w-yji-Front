import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-contact-transport',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-transport.component.html',
  styleUrl: './contact-transport.component.css'
})
export class ContactTransportComponent {
  nom = '';
  email = '';
  telephone = '';
  message = '';
  adresseDepart = '';

  envoyerFormulaire() {
    if (!this.nom || !this.email || !this.telephone || !this.message) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    alert('Message envoyé !');
    // Ici tu peux ajouter une requête HTTP vers ton backend si nécessaire
  }

  calculerItineraire() {
    if (!this.adresseDepart) {
      alert("Veuillez entrer une adresse de départ");
      return;
    }
    const destination = encodeURIComponent('25 Rue Honoré Euzet, 34200 Sète');
    const depart = encodeURIComponent(this.adresseDepart);
    window.open(`https://www.google.com/maps/dir/${depart}/${destination}`, '_blank');
  }
}
