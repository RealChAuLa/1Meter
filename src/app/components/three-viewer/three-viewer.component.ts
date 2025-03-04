import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ThreeService } from '../../services/three.service';


@Component({
  selector: 'app-three-viewer',
  templateUrl: './three-viewer.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./three-viewer.component.css']
})
export class ThreeViewerComponent implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  constructor(private threeService: ThreeService) {}

  ngOnInit(): void {
    this.threeService.initialize(this.rendererContainer.nativeElement);
    this.threeService.animate();
  }

  ngOnDestroy(): void {
    this.threeService.dispose();
  }
}
