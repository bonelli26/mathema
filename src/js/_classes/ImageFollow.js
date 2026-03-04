import { lerp, distance } from '../_global/helpers';
import { gsap } from 'gsap';
import {domStorage, globalStorage} from "../_global/storage";
import {$scroll} from "../_global/_renderer";

export class ImageFollow {

    constructor(el, imgArr) {
        this.imgArr = imgArr;

        // Image container
        this.dom = {
            el: el,
            followImg: el.querySelector('.follow img'),
            mobileImgs: el.querySelectorAll('img')
        };

        this.gestureWrapper = document.getElementById('st')

        this.imageIdx = 1;

        // Image trails
        this.trailsTotal = imgArr.length;

        this.zIndex = globalStorage.isGreaterThan767 ? 0 : 30;

        this.hoveringNav = false;
        this.firstPop = false;
        this.veryFirstPop = true;

        // mouse distance required to show the first trail image
        this.threshold = globalStorage.isGreaterThan767 ? 100 : 50;
        this.trailPosition = 0;

        this.getCache();
        // Init/Bind events
        this.initEvents();
        if (globalStorage.isGreaterThan767) {
            requestAnimationFrame(() => this.render());
        }

    }

    getCache() {
        this.movedOnce = false;
        let bounds = this.dom.el.getBoundingClientRect();

        this.origPos = {
            x: bounds.left + (bounds.width / 2),
            y: bounds.top + (bounds.height / 2),
            widthDiff: (bounds.width / 2),
            heightDiff: (bounds.height / 2)
        };

        this.cursorPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            lerped: {x: 0, y: 0},
            amt: 1
        };

        // Trails translations
        this.trailsTranslation = [...new Array(this.trailsTotal)].map(() => ({
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
        }));
    }

    initEvents() {
        let thisEvent = globalStorage.isMobile ? "touchmove" : "mousemove";

        this.gestureWrapper.addEventListener(thisEvent, (event) => {
            this.mouseVector = { x: (globalStorage.isMobile ? event.touches[0].clientX : event.clientX) - this.origPos.x, y: (globalStorage.isMobile ? event.touches[0].clientY : event.clientY) - this.origPos.y };
            if (!this.movedOnce) {
                this.cursorPos.previous = this.mouseVector;
                if (globalStorage.isGreaterThan767) {
                    gsap.to(this.dom.followImg.parentElement,{ duration: 0.6, opacity: 1, ease: "sine.inOut", force3D: true });
                }
            }
            this.movedOnce = true;
            this.cursorPos.current = this.mouseVector;

            if (globalStorage.isGreaterThan767) {
                for (let i = 0; i < this.trailsTotal - 1; i++) {
                    this.trailsTranslation[i].current = this.mouseVector;
                }
            } else {
                this.checkMovedDist();
            }
        });

        if (globalStorage.isMobile && globalStorage.isGreaterThan767) {
            this.gestureWrapper.addEventListener("touchstart", (event) => {
                if (this.veryFirstPop) {
                    this.veryFirstPop = false;
                    return;
                }
                this.firstPop = true;
            });
        }

        if (globalStorage.isMobile && !globalStorage.isGreaterThan767) {
            this.gestureWrapper.addEventListener("click", (event) => {
                this.zIndex++;
                gsap.set(this.dom.mobileImgs[this.imageIdx], { zIndex: this.zIndex });
                if (this.imageIdx === this.dom.mobileImgs.length - 1) {
                    this.imageIdx = 0;
                } else {
                    this.imageIdx++;
                }
            });
        }

        if (!globalStorage.isMobile) {
            let fadeHitbox = domStorage.header;
            let navItemsHitbox = domStorage.headerLinks[0].parentElement;
            let hoveringNavItems = false;
            navItemsHitbox.addEventListener("mouseenter", () => {
                hoveringNavItems = true;
            });

            navItemsHitbox.addEventListener("mousemove", () => {
                if (!hoveringNavItems) {
                    hoveringNavItems = true;
                    gsap.to(this.dom.followImg, { opacity: 0.25, duration: 0.3, ease: "sine.inOut" });
                    this.hoveringNav = true;
                }
            });

            navItemsHitbox.addEventListener("mouseleave", () => {
                hoveringNavItems = false;
            });

            fadeHitbox.addEventListener("mouseenter", () => {
                gsap.to(this.dom.followImg, { opacity: 0.25, duration: 0.3, ease: "sine.inOut" });
                this.hoveringNav = true;
            });

            fadeHitbox.addEventListener("mousemove", () => {
                if (!this.hoveringNav) {
                    gsap.to(this.dom.followImg, { opacity: 0.25, duration: 0.3, ease: "sine.inOut" });
                    this.hoveringNav = true;
                }
            });

            fadeHitbox.addEventListener("mouseleave", () => {
                gsap.delayedCall(0.05, () => {
                    if (!hoveringNavItems) {
                        gsap.to(this.dom.followImg, { opacity: 1, duration: 0.3, ease: "sine.inOut" });
                        this.hoveringNav = false;
                    }
                });

            });
        }

    }

    render() {
        this.cursorPos.lerped.x = lerp(this.cursorPos.lerped.x, this.cursorPos.current.x, 0.2);
        this.cursorPos.lerped.y = lerp(this.cursorPos.lerped.y, this.cursorPos.current.y, 0.2);

        gsap.set(this.dom.followImg, { x: this.cursorPos.lerped.x, y: this.cursorPos.lerped.y });

        if (this.hoveringNav) {
            requestAnimationFrame(() => this.render());
            return;
        }

        this.checkMovedDist();

        requestAnimationFrame(() => this.render());
    }

    releaseTrailImage(trailEl) {
        let currentPrev = this.cursorPos.previous;

        gsap.set(trailEl, { x: currentPrev.x, y: currentPrev.y + $scroll.data.scrollY })

        gsap.timeline()
            .set(trailEl, { zIndex: this.zIndex, opacity: 1 })
            .to(trailEl, 0.4, { opacity: 0, ease: "sine.out", onComplete: () => {
                    trailEl.remove();
                }
            }, "+=0.9");
    }

    checkMovedDist() {

        const movedDistance = distance(this.cursorPos.previous.x, this.cursorPos.previous.y, this.cursorPos.current.x, this.cursorPos.current.y);

        if (movedDistance > this.threshold) {
            if (globalStorage.isMobile && this.firstPop && globalStorage.isGreaterThan767) {
                this.firstPop = false;
                this.cursorPos.previous = this.cursorPos.current;
                return;
            }

            if (!globalStorage.isGreaterThan767) {
                this.zIndex++;
                gsap.set(this.dom.mobileImgs[this.imageIdx], { zIndex: this.zIndex });
                if (this.imageIdx === this.dom.mobileImgs.length - 1) {
                    this.imageIdx = 0;
                } else {
                    this.imageIdx++;
                }

                this.cursorPos.previous = this.cursorPos.current;
            } else {
                this.imgArr.unshift(this.imgArr.pop());

                this.dom.followImg.src = this.imgArr[0];
                const el = document.createElement('img');
                el.className = 'trail';
                el.src = this.imgArr[1];

                // console.log()

                this.dom.el.appendChild(el);

                this.zIndex++;

                this.releaseTrailImage(el);

                this.trailPosition = this.trailPosition < (this.trailsTotal - 1) ? (this.trailPosition + 1) : 0;

                this.cursorPos.previous = this.cursorPos.current;
            }
        }
    }

}
