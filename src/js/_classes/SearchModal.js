import { gsap } from "gsap";
import {domStorage, globalStorage} from "../_global/storage";
import {Prefetch} from "../_global/helpers";
import {$scroll} from "../_global/_renderer";

export class SearchModal {

    constructor() {
        this.modal = document.querySelector(".search-modal");
        if( !this.modal ) { return; }
        this.trigger = document.querySelector(".search");
        this.closeTrigger = this.modal.querySelector(".close");
        this.outcome = this.modal.querySelector(".outcome");
        this.input = this.modal.querySelector("input");
        this.isOpen = false;
        this.timeline = new gsap.timeline();
        this.bindListeners();

		gsap.set(this.modal, { autoAlpha: 0, xPercent: 50 });
        // gsap.set(this.outcome, { autoAlpha: 0 });
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

    }

    open() {
		if (this.isOpen) { return; }
		this.isOpen = true;
		this.timeline.clear();
		this.timeline.progress(0);
		this.timeline
			.set(this.modal, { pointerEvents: "all" })
            .to(this.modal, { xPercent: 0, duration: 0.2, force3D: true, ease: "sine.inOut" })
            .to(this.modal, { autoAlpha: 1, duration: 0.2, force3D: true, ease: "sine.inOut" }, "<")
    }

    close() {
		if (!this.isOpen) { return; }
		this.isOpen = false;
        this.timeline.clear();
        this.timeline.progress(0);
		this.timeline
        .to(this.modal, { xPercent: 50, duration: 0.15, force3D: true, ease: "sine.inOut" })
        .to(this.modal, { autoAlpha: 0, duration: 0.15, force3D: true, ease: "sine.inOut" }, "<")
        .set(this.modal, { pointerEvents: "none"})
    }


}
