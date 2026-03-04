import { gsap } from "gsap";
import {domStorage, globalStorage} from "../_global/storage";

export class MiniCart {
    constructor(trigger) {
        this.backdrop = document.getElementById('mini-cart-backdrop');
        this.trigger = document.getElementById('mini-cart-trigger');
        this.inner = domStorage.miniCart.querySelector(".wrapper")
        this.overflowEl = domStorage.miniCart.querySelector(".content")
        this.fadeEls = domStorage.miniCart.querySelectorAll(".fade-el");
        this.lineItems = domStorage.miniCart.querySelectorAll(".line-item");
        this.closeTrigger = domStorage.miniCart.querySelector(".close");
        this.bg = domStorage.miniCart.querySelector(".backdrop");
        this.isOpen = false;
        this.timeline = new gsap.timeline();
        this.bindListeners();
        gsap.set(this.bg, { scale: 0.8, opacity: 0, force3D: true  });
        gsap.set(this.backdrop, { opacity: 0 })
        gsap.set(this.fadeEls, { opacity: 0 })
        gsap.set(domStorage.miniCart, { autoAlpha: 1 })
        console.log(this.lineItems.length)
        if (this.lineItems.length > 0) {
            gsap.set(this.lineItems, { opacity: 0, y: 30 })
        }
    }

    bindListeners() {
        this.trigger.addEventListener("click", () => {
            this.open();
        });
        this.closeTrigger.addEventListener("click", () => {
            this.close();
        });
        document.addEventListener('keyup', (event) => {
            const key = event.key;
            if (key === 'Escape' || key === 'Esc') {
                this.close();
            }
        });
        this.backdrop.addEventListener("click", () => {
            this.close();
        });
    }

    open() {
        if (this.isOpen) { return; }
        this.isOpen = true;
        this.timeline.clear();

        this.timeline
            .set([domStorage.miniCart, this.backdrop], { pointerEvents: 'all' })
        if (globalStorage.windowWidth > 767) {
            this.timeline
                .to(this.backdrop, { duration: 0.2, autoAlpha: 1, ease: "sine.out", force3D: true })
        }
        this.timeline
            .to(this.bg, { duration: .65, scale: 1, force3D: true, ease: "expo.out" }, 0)
            .to(this.bg, { duration: .135, opacity: 1, force3D: true, ease: "sine.out" }, 0)
            .to(this.fadeEls, { duration: .2, opacity: 1, force3D: true, ease: "sine.inOut", clearProps: 'transform' }, 0.2)
        if (this.lineItems.length > 0) {
            this.timeline.to(this.lineItems, { duration: .8, y: 0, stagger: 0.05, force3D: true, ease: "expo.out" }, 0.18)
            this.timeline.to(this.lineItems, { duration: .22, opacity: 1, stagger: 0.05, force3D: true, ease: "sine.out" }, 0.2)
        }

    }

    close() {
        if (!this.isOpen) { return; }
        this.isOpen = false;
        this.timeline.clear();

        this.timeline
            .set([domStorage.miniCart, this.backdrop], { pointerEvents: 'none' })
            .to(this.fadeEls, { duration: .16, opacity: 0, force3D: true, ease: "sine.out", clearProps: 'transform', onComplete: () => {
                    this.overflowEl.scrollTop = 0
                } })
        if (this.lineItems.length > 0) {
            this.timeline.to(this.lineItems, { duration: .16, opacity: 0, transformOrigin: 'center', force3D: true, ease: "sine.out", onComplete: () => {
                    gsap.set(this.lineItems, {y: 30})
                } }, 0)
        }
        if (globalStorage.windowWidth > 767) {
            this.timeline
                .to(this.backdrop, { duration: 0.3, autoAlpha: 0, ease: "sine.inOut", force3D: true }, 0.05)
        }
        this.timeline
            .to(this.bg, { duration: .5, scale: .8, force3D: true, ease: "expo.inOut" }, 0)
            .to(this.bg, { duration: .33, opacity: 0, force3D: true, ease: "sine.inOut" }, 0)
    }

    resize() {
        //
    }
}
