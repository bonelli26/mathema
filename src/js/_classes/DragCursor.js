import { gsap } from "gsap";
import {lerp} from "../_global/helpers";
import { globalStorage, domStorage } from "../_global/storage";
import {$scroll} from "../_global/_renderer";

export class DragCursor {
    constructor(el) {
        if (!el) return;
        ["onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseDown", "run"].forEach(fn => this[fn] = this[fn].bind(this));
        this.el = el;
        this.ease = globalStorage.isMobile ? 0.12 : 0.095;
        this.isRunning = false;
        this.clicked = false
        this.getCache();
        this.addEvents();
    }

    getCache() {
        this.bounds = this.el.getBoundingClientRect();
        this.cursorWidth = domStorage.dragCursor.offsetWidth
        this.cursorHeight = domStorage.dragCursor.offsetHeight
        this.mouse = {
            cur: {
                x: 0,
                y: 0,
            },
            last: {
                x: 0,
                y: 0,
            }
        };
        gsap.set(domStorage.dragCursor, { x: 0, y: 0, autoAlpha: 0, force3D: true });
    }

    addEvents() {
        this.moveEvent = globalStorage.isMobile ? "touchmove" : "mousemove";
        this.enterEvent = globalStorage.isMobile ? "touchstart" : "mouseenter";
        this.leaveEvent = globalStorage.isMobile ? "touchend" : "mouseleave";
        this.el.addEventListener('click', () => { this.clicked = true }, false);
        this.el.addEventListener(this.enterEvent, this.onMouseEnter, false);
        this.el.addEventListener(this.leaveEvent, this.onMouseLeave, false);
        this.el.addEventListener(this.moveEvent, this.onMouseMove, false);
        if (!globalStorage.isMobile) {
            this.el.addEventListener("mousedown", this.onMouseDown, false);
            this.el.addEventListener("mouseup", this.onMouseUp, false);
        }
    }

    run() {
        if (!this.isRunning) return;

        this.mouse.last.x = lerp(this.mouse.last.x, this.mouse.cur.x, this.ease);
        this.mouse.last.y = lerp(this.mouse.last.y, this.mouse.cur.y, this.ease);
        gsap.set(domStorage.dragCursor, { x: (this.mouse.last.x - (this.cursorWidth * .5)), y: (this.mouse.last.y - (this.cursorHeight * .5)), force3D: true });
        this.raf = requestAnimationFrame(this.run);
    }

    onMouseDown() {
        gsap.to(domStorage.dragCursor, { scale: 0.85, duration: 0.55, ease: 'expo.out', force3D: true });
    }

    onMouseUp() {
        gsap.to(domStorage.dragCursor, { scale: 1, duration: 0.55, ease: 'expo.out', force3D: true });
    }

    onMouseEnter(event, first = false) {
        if (globalStorage.mouseEnterContext !== false && first === false) { return; }
        globalStorage.mouseEnterContext = "DragCursorHover";
        globalStorage.mouseEnterData = this;
        this.isRunning = true;
        this.setCurMousePos(event)
        this.mouse.last.x = this.mouse.cur.x;
        this.mouse.last.y = this.mouse.cur.y;

        if (globalStorage.isMobile) {
            gsap.delayedCall(.2, () => {
                if (!this.clicked) {
                    gsap.set(domStorage.dragCursor, { scale: 0.38, x: (this.mouse.cur.x - (this.cursorWidth * .5)), y: (this.mouse.cur.y - (this.cursorHeight * .5)) });
                    gsap.to(domStorage.dragCursor, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', force3D: true });
                }
            })
        } else {
            gsap.set(domStorage.dragCursor, { scale: 0.38, x: (this.mouse.cur.x - (this.cursorWidth * .5)), y: (this.mouse.cur.y - (this.cursorHeight * .5)) });
            gsap.to(domStorage.dragCursor, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out', force3D: true });
        }

        this.run();
    }

    onMouseMove(event) {
        if (globalStorage.mouseEnterContext === false) { this.onMouseEnter(event, true); }

        this.setCurMousePos(event)
    }

    setCurMousePos(event) {
        this.mouse.cur.x = globalStorage.isMobile ? event.changedTouches[0].pageX : event.clientX;
        this.mouse.cur.y = globalStorage.isMobile ? (event.changedTouches[0].clientY - $scroll.data.scrollY) : event.clientY;
    }

    onMouseLeave() {
        this.isRunning = false;
        cancelAnimationFrame(this.raf);
        globalStorage.mouseEnterContext = false;
        gsap.to(domStorage.dragCursor, { autoAlpha: 0, scale: 0.38, duration: 0.6, ease: 'expo.out' });
    }

    destroy() {
        this.isRunning = false;
        cancelAnimationFrame(this.raf);
        globalStorage.mouseEnterContext = false;
        domStorage.dragCursor = null;
        this.mouse = null;
        this.state = null;
        this.el.addEventListener(this.enterEvent, this.onMouseEnter, false);
        this.el.addEventListener(this.leaveEvent, this.onMouseLeave, false);
        this.el.addEventListener(this.moveEvent, this.onMouseMove, false);
    }
}
