import { Component } from '@angular/core';
import {HeroComponent} from '../hero/hero.component';
import {FeaturesComponent} from '../features/features.component';
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
    imports: [
        HeroComponent,
        FeaturesComponent,
        NavbarComponent
    ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
