import { gsap } from "gsap";
import { bind, lerp } from "../_global/helpers";
import { globalStorage } from "../_global/storage";
import { $scroll } from "../_global/_renderer";

export class ThumbnailWrapper {
	constructor(el) {
		if (!el) return

		bind(this, ["onMouseMove", "setPos", "start", "stop", "run"]);

		this.dom = {
			el,
			clientList: document.querySelector(".client-list")
		};

		this.cur = {
			x: globalStorage.windowWidth / 2,
			y: globalStorage.windowHeight / 2,
		};

		this.last = {
			x: this.cur.x,
			y: this.cur.y
		};

		this.state = {
			isRunning: false,
		};

		this.ease = 0.1;

		this.addEvents();
	}

	addEvents() {
		const moveEvent = globalStorage.isMobile ? "touchmove" : "mousemove";
		const enterEvent = globalStorage.isMobile ? "touchstart" : "mouseenter";
		const leaveEvent = globalStorage.isMobile ? "touchend" : "mouseleave";

		document.addEventListener(moveEvent, this.onMouseMove, { passive: true });

		this.dom.clientList.addEventListener(enterEvent, this.start);
		this.dom.clientList.addEventListener(leaveEvent, this.stop);
	}

	onMouseMove(event) {
		this.setPos(event);
	}

	setPos(event) {
		this.cur = {
			x: globalStorage.isMobile ? event.changedTouches[0].pageX : event.layerX,
			y: globalStorage.isMobile ? (event.changedTouches[0].pageY - $scroll.data.scrollY) : (event.pageY - $scroll.data.scrollY),
			dir: ''
		};
		// console.log(event);
	}

	run() {
		if (!this.state.isRunning) return;

		this.last.x = lerp(this.last.x, this.cur.x, this.ease);
		this.last.y = lerp(this.last.y, this.cur.y, this.ease);
		if(this.cur.x > this.last.x) {
			this.cur.dir = 'right'
		} else {
			this.cur.dir = 'left'
		}
		gsap.set(this.dom.el, { x: this.last.x, y: this.last.y, force3D: true });

		this.raf = requestAnimationFrame(this.run);
	}

	start() {
		this.state.isRunning = true;
		gsap.set(this.dom.el, { x: this.last.x, y: this.last.y, z: 0 });
		this.run();

	}

	stop() {
		this.state.isRunning = false;
		cancelAnimationFrame(this.raf);

	}

	kill() {
		cancelAnimationFrame(this.raf);

		document.removeEventListener("mousemove", this.onMouseMove, { passive: true });

		this.dom = null;
		this.cur = null;
		this.last = null;
		this.state = null;
		this.ease = null;
		this.raf = null;
	}
}
