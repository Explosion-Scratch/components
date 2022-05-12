<script>
  //This component is in beta: It doesn't support dynamic options yet.
	import * as THREE from 'three';
	import { browser } from '$app/env';
	import { onMount, onDestroy } from 'svelte';
	import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
	export let style = '';
	let container,
		listeners = {};

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mousedown', listeners.mousedown);
			document.removeEventListener('mousemove', listeners.mousemove);
			document.removeEventListener('mouseup', listeners.mouseup);
		}
	});

	export let OPTIONS = {
		text: 'CHANGE ME',
		amount: 3000,
		particleSize: 1,
		particleColor: 0xffffff,
		textSize: 16,
		area: 500,
		ease: 0.05
	};
	const HSL = [0.5, 1, 0.2];
	onMount(() => {
		preload();
		console.log(container);
	});

	function percentage(event, type) {
		let rect = container.getBoundingClientRect();
		if (type === 'x') {
			return (event.clientX + rect.left) / rect.width;
		} else if (type === 'y') {
			return (event.clientY + rect.top) / rect.height;
		}
	}

	const preload = () => {
		let manager = new THREE.LoadingManager();
		manager.onLoad = function () {
			const environment = new Environment(typo, particle);
		};

		var typo = null;
		const loader = new FontLoader(manager);
		const font = loader.load('montserrat.json', function (font) {
			typo = font;
		});
		const particle = new THREE.TextureLoader(manager).load(
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA/ElEQVRYhe2WsQ6CMBRFT131H3RwM3F3M/HH/Bm/gNmNhN3ECRf+QefrQE0MttiSVmLCGaF59/AK9MHExMiYmMWSNsAB2AFbYGlvNcAFqICzMeaaUhJJK0lHSbW+U9u1q1The0lFQHCXQtI+RXg5IPxFOVhCbduHPLmrE/HboXYfU3GMDd8o7IULpVb7BX0w8zgcgHVk0/pY25rBAruE4b01fQLbDALOms4/oaQ7ME8s8DDGLLoXfR34GT6BJkOWs6ZP4JJBwFnTJ1BlEHDW9AmcgVvC8JutGSZgz/NTQoFT9IygsQ8jKzHecdyRGGcgeZPINpL9x1A6MZGTJwtG0XIzCYYTAAAAAElFTkSuQmCC'
		);
	};

	const VERTEX_SHADER = `    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
  
    void main() {
  
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
  
    }`;
	const FRAGMENT_SHADER = `   uniform vec3 color;
   uniform sampler2D pointTexture;
  
   varying vec3 vColor;
  
   void main() {
  
     gl_FragColor = vec4( color * vColor, 1.0 );
     gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  
   }`;
	class Environment {
		constructor(font, particle) {
			this.font = font;
			this.particle = particle;
			this.container = container;
			this.scene = new THREE.Scene();
			this.createCamera();
			this.createRenderer();
			this.setup();
			this.bindEvents();
		}

		bindEvents() {
			window.addEventListener('resize', this.onWindowResize.bind(this));
		}

		setup() {
			this.createParticles = new CreateParticles(
				this.scene,
				this.font,
				this.particle,
				this.camera,
				this.renderer
			);
		}

		render() {
			this.createParticles.render();
			this.renderer.render(this.scene, this.camera);
		}

		createCamera() {
			this.camera = new THREE.PerspectiveCamera(
				65,
				this.container.clientWidth / this.container.clientHeight,
				1,
				10000
			);
			this.camera.position.set(0, 0, 100);
		}

		createRenderer() {
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

			this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.container.appendChild(this.renderer.domElement);

			this.renderer.setAnimationLoop(() => {
				this.render();
			});
		}

		onWindowResize() {
			this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		}
	}

	class CreateParticles {
		constructor(scene, font, particleImg, camera, renderer) {
			this.scene = scene;
			this.font = font;
			this.particleImg = particleImg;
			this.camera = camera;
			this.renderer = renderer;

			this.raycaster = new THREE.Raycaster();
			this.mouse = new THREE.Vector2(-200, 200);

			this.colorChange = new THREE.Color();

			this.buttom = false;

			this.data = OPTIONS;

			this.setup();
			this.bindEvents();
		}

		setup() {
			const geometry = new THREE.PlaneGeometry(
				this.visibleWidthAtZDepth(100, this.camera),
				this.visibleHeightAtZDepth(100, this.camera)
			);
			const material = new THREE.MeshBasicMaterial({
				color: 0x00ff00,
				transparent: true
			});
			this.planeArea = new THREE.Mesh(geometry, material);
			this.planeArea.visible = false;
			this.createText();
		}

		bindEvents() {
			listeners = {
				mousedown: this.onMouseDown.bind(this),
				mousemove: this.onMouseMove.bind(this),
				mouseup: this.onMouseUp.bind(this)
			};
			document.addEventListener('mousedown', listeners.mousedown);
			document.addEventListener('mousemove', listeners.mousemove);
			document.addEventListener('mouseup', listeners.mouseup);
		}
		onMouseDown(event) {
			this.mouse.x = percentage(event, 'x') * 2 - 1;
			this.mouse.y = -percentage(event, 'y') * 2 + 1;

			const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
			vector.unproject(this.camera);
			const dir = vector.sub(this.camera.position).normalize();
			const distance = -this.camera.position.z / dir.z;
			this.currenPosition = this.camera.position.clone().add(dir.multiplyScalar(distance));

			const pos = this.particles.geometry.attributes.position;
			this.buttom = true;
			this.data.ease = 0.01;
		}

		onMouseUp(event) {
			this.buttom = false;
			this.data.ease = 0.05;
		}

		onMouseMove(event) {
			this.mouse.x = percentage(event, 'x') * 2 - 1;
			this.mouse.y = -percentage(event, 'y') * 2 + 1;
		}

		render(level) {
			const time = ((0.001 * performance.now()) % 12) / 12;
			const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

			this.raycaster.setFromCamera(this.mouse, this.camera);

			const intersects = this.raycaster.intersectObject(this.planeArea);

			if (intersects.length > 0) {
				const pos = this.particles.geometry.attributes.position;
				const copy = this.geometryCopy.attributes.position;
				const coulors = this.particles.geometry.attributes.customColor;
				const size = this.particles.geometry.attributes.size;

				const mx = intersects[0].point.x;
				const my = intersects[0].point.y;
				const mz = intersects[0].point.z;

				for (var i = 0, l = pos.count; i < l; i++) {
					const initX = copy.getX(i);
					const initY = copy.getY(i);
					const initZ = copy.getZ(i);

					let px = pos.getX(i);
					let py = pos.getY(i);
					let pz = pos.getZ(i);

					this.colorChange.setHSL(0.5, 1, 1);
					coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
					coulors.needsUpdate = true;

					size.array[i] = this.data.particleSize;
					size.needsUpdate = true;

					let dx = mx - px;
					let dy = my - py;
					const dz = mz - pz;

					const mouseDistance = this.distance(mx, my, px, py);
					let d = (dx = mx - px) * dx + (dy = my - py) * dy;
					const f = -this.data.area / d;

					if (this.buttom) {
						const t = Math.atan2(dy, dx);
						px -= f * Math.cos(t);
						py -= f * Math.sin(t);

						this.colorChange.setHSL(0.5 + zigzagTime, 1.0, 0.5);
						coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
						coulors.needsUpdate = true;

						if (px > initX + 70 || px < initX - 70 || py > initY + 70 || py < initY - 70) {
							this.colorChange.setHSL(...HSL);
							coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
							coulors.needsUpdate = true;
						}
					} else {
						if (mouseDistance < this.data.area) {
							if (i % 5 == 0) {
								const t = Math.atan2(dy, dx);
								px -= 0.03 * Math.cos(t);
								py -= 0.03 * Math.sin(t);

								this.colorChange.setHSL(...HSL);
								coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
								coulors.needsUpdate = true;

								size.array[i] = this.data.particleSize / 1.2;
								size.needsUpdate = true;
							} else {
								const t = Math.atan2(dy, dx);
								px += f * Math.cos(t);
								py += f * Math.sin(t);

								pos.setXYZ(i, px, py, pz);
								pos.needsUpdate = true;

								size.array[i] = this.data.particleSize * 1.3;
								size.needsUpdate = true;
							}

							if (px > initX + 10 || px < initX - 10 || py > initY + 10 || py < initY - 10) {
								this.colorChange.setHSL(...HSL);
								coulors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
								coulors.needsUpdate = true;

								size.array[i] = this.data.particleSize / 1.8;
								size.needsUpdate = true;
							}
						}
					}

					px += (initX - px) * this.data.ease;
					py += (initY - py) * this.data.ease;
					pz += (initZ - pz) * this.data.ease;

					pos.setXYZ(i, px, py, pz);
					pos.needsUpdate = true;
				}
			}
		}

		createText() {
			let thePoints = [];

			let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
			let geometry = new THREE.ShapeGeometry(shapes);
			geometry.computeBoundingBox();

			const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

			geometry.center();

			let holeShapes = [];

			for (let q = 0; q < shapes.length; q++) {
				let shape = shapes[q];

				if (shape.holes && shape.holes.length > 0) {
					for (let j = 0; j < shape.holes.length; j++) {
						let hole = shape.holes[j];
						holeShapes.push(hole);
					}
				}
			}
			shapes.push.apply(shapes, holeShapes);

			let colors = [];
			let sizes = [];

			for (let x = 0; x < shapes.length; x++) {
				let shape = shapes[x];

				const amountPoints = shape.type == 'Path' ? this.data.amount / 2 : this.data.amount;

				let points = shape.getSpacedPoints(amountPoints);

				points.forEach((element, z) => {
					const a = new THREE.Vector3(element.x, element.y, 0);
					thePoints.push(a);
					colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
					sizes.push(1);
				});
			}

			let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
			geoParticles.translate(xMid, yMid, 0);

			geoParticles.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
			geoParticles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

			const material = new THREE.ShaderMaterial({
				uniforms: {
					color: { value: new THREE.Color(0xffffff) },
					pointTexture: { value: this.particleImg }
				},
				vertexShader: VERTEX_SHADER,
				fragmentShader: FRAGMENT_SHADER,

				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true
			});

			this.particles = new THREE.Points(geoParticles, material);
			this.scene.add(this.particles);

			this.geometryCopy = new THREE.BufferGeometry();
			this.geometryCopy.copy(this.particles.geometry);
		}

		visibleHeightAtZDepth(depth, camera) {
			const cameraOffset = camera.position.z;
			if (depth < cameraOffset) depth -= cameraOffset;
			else depth += cameraOffset;

			const vFOV = (camera.fov * Math.PI) / 180;

			return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
		}

		visibleWidthAtZDepth(depth, camera) {
			const height = this.visibleHeightAtZDepth(depth, camera);
			return height * camera.aspect;
		}

		distance(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		}
	}
</script>

<div id="background" bind:this={container} {style} />

<style>
	#background {
		position: absolute;
		width: 100%;
		display: block;
		top: 0;
		left: 0;
		z-index: -9999;
		background-color: black;
	}
</style>
