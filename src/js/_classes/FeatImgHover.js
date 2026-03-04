import { gsap } from "gsap";
import {lerp} from "../_global/helpers";
import { globalStorage } from "../_global/storage";
import {$scroll} from "../_global/_renderer";


export class FeatImgHover {
	constructor(el, i) {
		if (!el) return;
		["onMouseEnter", "onMouseLeave", "onMouseMove", "run"].forEach(fn => this[fn] = this[fn].bind(this));
		this.bounds = el.getBoundingClientRect();
		this.centerBounds = [this.bounds.width / 2, this.bounds.height / 2];
		this.el = el;
		this.image = el.querySelector('img');
		this.ease = globalStorage.isMobile ? 0.12 : 0.08;
		this.isRunning = false;
		this.clicked = false
		this.getCache();
		this.addEvents();
	}

	getCache() {
		this.imageWidth = this.image.offsetWidth
		this.imageHeight = this.image.offsetHeight
		this.mouse = {
			totalDistance: 0,
			cur: {
				x: 0,
				y: 0,
			},
			last: {
				x: 0,
				y: 0,
			}
		};
		gsap.set(this.image, { x: 0, y: 0, autoAlpha: 0, force3D: true });
	}

	addEvents() {
		this.moveEvent = globalStorage.isMobile ? "touchmove" : "mousemove";
		this.enterEvent = globalStorage.isMobile ? "touchstart" : "mouseenter";
		this.leaveEvent = globalStorage.isMobile ? "touchend" : "mouseleave";
		this.el.addEventListener('click', () => { this.clicked = true }, false);
		this.el.addEventListener(this.enterEvent, this.onMouseEnter, false);
		this.el.addEventListener(this.leaveEvent, this.onMouseLeave, false);
		this.el.addEventListener(this.moveEvent, this.onMouseMove, false);
	}

	run() {
		if (!this.isRunning) return;

		this.mouse.last.x = lerp(this.mouse.last.x, this.mouse.cur.x, this.ease);
		this.mouse.last.y = lerp(this.mouse.last.y, this.mouse.cur.y, this.ease);
		gsap.set(this.image, { x: (this.mouse.last.x - this.imageWidth / 2), y: (this.mouse.last.y - (this.imageHeight * .5)), force3D: true });
		this.raf = requestAnimationFrame(this.run);
	}

	onMouseEnter(event, first = false) {
		if (globalStorage.mouseEnterContext !== false && first === false) { return; }
		globalStorage.mouseEnterContext = "FeatImgHover";
		globalStorage.mouseEnterData = this;
		this.isRunning = true;
		this.setCurMousePos(event)
		this.mouse.last.x = this.mouse.cur.x;
		this.mouse.last.y = this.mouse.cur.y;

		gsap.set(this.el, { zIndex: 5 });
		this.el.classList.add('active')

		if (globalStorage.isMobile) {
			gsap.delayedCall(.2, () => {
				if (!this.clicked) {
					gsap.set(this.image, { scale: 0.38, x: (this.mouse.cur.x - this.imageWidth / 2), y: (this.mouse.cur.y - (this.imageHeight * .5)) });
					gsap.to(this.image, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', force3D: true });
				}
			})
		} else {
			gsap.set(this.image, { scale: 0.38, x: (this.mouse.cur.x - this.imageWidth / 2), y: (this.mouse.cur.y - (this.imageHeight * .5)) });
			gsap.to(this.image, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', force3D: true });
		}

		this.run();
	}

	onMouseMove(event) {
		if (globalStorage.mouseEnterContext === false) { this.onMouseEnter(event, true); }

		this.setCurMousePos(event)
	}

	setCurMousePos(event) {
		this.mouse.cur.x = globalStorage.isMobile ? event.changedTouches[0].pageX : event.layerX;
		this.mouse.cur.y = globalStorage.isMobile ? (event.changedTouches[0].pageY - $scroll.data.scrollY - event.changedTouches[0].clientY) + 34 : event.layerY;
	}

	onMouseLeave() {
		this.isRunning = false;
		cancelAnimationFrame(this.raf);
		globalStorage.mouseEnterContext = false;
		gsap.set(this.el, { zIndex: 1 })
		this.el.classList.remove('active')
		gsap.to(this.image, { autoAlpha: 0, scale: 0.38, duration: 0.6, ease: 'expo.out' });
	}

	destroy() {
		this.isRunning = false;
		cancelAnimationFrame(this.raf);
		globalStorage.mouseEnterContext = false;
		gsap.set(this.el, { zIndex: 1 })
		this.el.classList.remove('active')
		this.image = null;
		this.mouse = null;
		this.state = null;
		this.el.addEventListener(this.enterEvent, this.onMouseEnter, false);
		this.el.addEventListener(this.leaveEvent, this.onMouseLeave, false);
		this.el.addEventListener(this.moveEvent, this.onMouseMove, false);
	}
}
