import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model: THREE.Object3D | null = null;
  private animationId: number | null = null;
  private autoRotate = true;
  private ringLights: Array<{
    light: THREE.PointLight;
    initialX: number;
    initialZ: number;
    angle: number;
    speed: number;
  }> = [];
  private flashlight!: THREE.SpotLight;

  constructor(private ngZone: NgZone) {}

  initialize(container: HTMLElement): void {
    // Scene setup
    this.scene = new THREE.Scene();
    // Set background color to black
    this.scene.background = new THREE.Color(0xffffff);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.setZ(100);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    // Enable shadow maps
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Create a flashlight that follows the camera
    this.flashlight = new THREE.SpotLight(0xffffff, 50, 100, Math.PI / 6, 0.5, 1);
    this.flashlight.position.set(0, 0, 0); // Will be updated to camera position
    this.flashlight.target.position.set(0, 0, -1); // Will be updated based on camera direction
    this.flashlight.castShadow = true;
    this.scene.add(this.flashlight);
    this.scene.add(this.flashlight.target);
    this.camera.add(this.flashlight); // Attach the light to the camera
    this.camera.add(this.flashlight.target); // Attach the target to the camera
    this.flashlight.target.position.set(0, 0, -1); // Target is 1 unit in front of the camera
    this.scene.add(this.camera); // Add camera to the scene to include its children

    // Base ambient lighting - slightly increased for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Main top spotlight - bright white
    const topSpotlight = new THREE.SpotLight(0xffffff, 4);
    topSpotlight.position.set(0, 30, 0);
    topSpotlight.angle = Math.PI / 6;
    topSpotlight.penumbra = 0.3;
    topSpotlight.decay = 1;
    topSpotlight.distance = 100;
    topSpotlight.castShadow = true;
    topSpotlight.shadow.bias = -0.0001;
    topSpotlight.target.position.set(0, 0, 0);
    this.scene.add(topSpotlight);
    this.scene.add(topSpotlight.target);

    // Blue accent light (front-right)
    const blueLight = new THREE.PointLight(0x0066ff, 12);
    blueLight.position.set(15, 10, 20);
    blueLight.distance = 60;
    blueLight.decay = 1.5;
    this.scene.add(blueLight);

    // Cyan accent light (front-left)
    const cyanLight = new THREE.PointLight(0x00ffff, 10);
    cyanLight.position.set(-15, 8, -10);
    cyanLight.distance = 60;
    cyanLight.decay = 1.5;
    this.scene.add(cyanLight);

    // Purple/pink accent light (back-right)
    const purpleLight = new THREE.PointLight(0xff00ff, 8);
    purpleLight.position.set(15, 5, -20);
    purpleLight.distance = 60;
    purpleLight.decay = 1.5;
    this.scene.add(purpleLight);

    // Orange accent light (back-left)
    const orangeLight = new THREE.PointLight(0xff6600, 8);
    orangeLight.position.set(-15, 5, -20);
    orangeLight.distance = 60;
    orangeLight.decay = 1.5;
    this.scene.add(orangeLight);

    // Bottom fill light
    const bottomLight = new THREE.PointLight(0x3366ff, 4);
    bottomLight.position.set(0, -15, 0);
    bottomLight.distance = 40;
    bottomLight.decay = 2;
    this.scene.add(bottomLight);

    // Add some subtle moving lights for dynamic effect
    // Create a ring of small lights around the model
    const ringLights = [];
    const ringRadius = 25;
    const ringHeight = 10;
    const ringLightCount = 8;

    for (let i = 0; i < ringLightCount; i++) {
      const angle = (i / ringLightCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      // Create a small intense light with color based on position
      const hue = (i / ringLightCount) * 360;
      const color = new THREE.Color(`hsl(${hue}, 100%, 60%)`);

      const ringLight = new THREE.PointLight(color, 3, 30, 2);
      ringLight.position.set(x, ringHeight, z);
      this.scene.add(ringLight);

      // Store for animation
      ringLights.push({
        light: ringLight,
        initialX: x,
        initialZ: z,
        angle: angle,
        speed: 0.005 + (Math.random() * 0.005) // Slightly different speeds
      });
    }
    this.ringLights = ringLights; // Store for animation

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 30;

    // Load model
    this.loadModel();

    // Mouse events
    this.renderer.domElement.addEventListener('mouseenter', () => this.autoRotate = false);
    this.renderer.domElement.addEventListener('mouseleave', () => this.autoRotate = true);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(container));
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    // Note: In Angular, assets should be placed in the assets folder
    loader.load(
      'assets/models/usagemeter.glb', // You'll need to place your model in the assets/models folder
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        this.model.position.sub(center);
        //positioning the model vertically
        this.model.rotation.z = 0;
        this.model.rotation.x = 0;
        this.model.rotation.y = 2;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDim;
        this.model.scale.multiplyScalar(scale);

        // Position camera
        const distance = 10;
        this.camera.position.set(distance, distance, distance);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
    );
  }

  animate(): void {
    this.ngZone.runOutsideAngular(() => {
      const animateLoop = () => {
        this.animationId = requestAnimationFrame(animateLoop);

        // Update ring lights
        const time = Date.now() * 0.001; // Current time in seconds
        this.ringLights.forEach((ringLightData) => {
          const { light, initialX, initialZ, angle, speed } = ringLightData;

          // Make the light move slightly
          const pulseAmount = Math.sin(time * 2 + angle) * 3; // Pulsating effect
          light.position.x = initialX + Math.sin(time + angle) * 2;
          light.position.z = initialZ + Math.cos(time + angle) * 2;
          light.position.y = light.position.y + Math.sin(time * 3 + angle) * 0.1;

          // Pulsate the intensity
          light.intensity = 3 + pulseAmount;
        });

        if (this.model && this.autoRotate) {
          this.model.rotation.y -= 0.01;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };

      animateLoop();
    });
  }

  private onWindowResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize);

    // Dispose of ThreeJS resources
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
