import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { LivrerColisComponent } from '../livrer-colis/livrer-colis.component';
import { FeaturesSectionComponent } from '../features-section/features-section.component';
import { HistoryAccessPanelComponent } from '../history-access-panel/history-access-panel.component';
import { ReclamationWidgetComponent } from '../reclamation-widget/reclamation-widget.component';
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [HeroComponent , LivrerColisComponent , FeaturesSectionComponent , HistoryAccessPanelComponent , ReclamationWidgetComponent] ,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

}
