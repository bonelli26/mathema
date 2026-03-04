import { HorizontalLoop } from "../_global/helpers";
import { gsap } from 'gsap';
import {domStorage, globalStorage} from "../_global/storage";

export class InfiniteSlider {

    constructor(wrapper) {
        this.loop = false;
        this.wrapper = wrapper;
        this.slides = [...wrapper.querySelectorAll('.product-card-wrapper')]
        this.bindEvents();
    }

    bindEvents() {
        this.loop = new HorizontalLoop(this.slides, {
            paused: true,
            draggable: true, // make it draggable
            center: false, // active element is the one in the center of the container rather than th left edge
            onChange: (element, index) => { // when the active element changes, this function gets called.
                // const activeCard = this.wrapper.querySelector('.product-card.active')
                // if (activeCard) {
                //     activeCard.classList.remove('active')
                // }
                // element.classList.add('active')
            }
        });

        // gsap.delayedCall(0.5, () => this.loop.firstLoad({duration: 0}))
    }

}
