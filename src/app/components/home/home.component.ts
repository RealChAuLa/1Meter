import { Component } from '@angular/core';
import {HeroComponent} from '../hero/hero.component';
import {FeaturesComponent} from '../features/features.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    FeaturesComponent
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
