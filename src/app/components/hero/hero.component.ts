import { Component } from '@angular/core';
import {ThreeViewerComponent} from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  standalone: true,
  imports: [ThreeViewerComponent],
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  buyNow() {
    console.log('Buy Now clicked');
    // Implement buy functionality
  }
}
