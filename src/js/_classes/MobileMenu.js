import { gsap } from "gsap";
import {domStorage, globalStorage} from "../_global/storage";
import {Prefetch} from "../_global/helpers";
import {$scroll} from "../_global/_renderer";

export class MobileMenu {
    // constructor() {
    //     this.nav = document.querySelector("nav");
    //     if( !this.nav ) { return; }
    //     this.trigger = document.getElementById("hammy");
    //     this.closeMenu = document.getElementById("closeMenu");
    //     this.navDrawer = document.getElementById("mobile-menu");
	// 	// this.links = this.navDrawer.querySelectorAll(".items a");
    //     this.bottomLinks = this.navDrawer.querySelectorAll(".bottom a");
    //     this.bg = this.navDrawer.querySelector(".bg");
    //     this.isOpen = false;
    //     this.tl = new gsap.timeline();
    //     this.bindListeners();

	// 	gsap.set([this.links, this.closeMenu, this.bottomLinks], { autoAlpha: 0, y: 20 });
	// 	gsap.set(this.bg, { autoAlpha: 0 });
    // }

    // bindListeners() {
    //     this.trigger.addEventListener("click", () => {                        
    //         this.open();            
    //     });
    //     this.closeMenu.addEventListener("click", () => {
    //         this.close();
    //     });
    // }

    // open() {
	// 	if (this.isOpen) { return; }
	// 	this.isOpen = true;
	// 	this.tl.clear();
	// 	this.tl.progress(0);        
    //     this.tl
	// 		.set(this.navDrawer, { pointerEvents: "all", autoAlpha: 1 })	
    //         .to(this.bg, { autoAlpha: 1, duration: 0.2, force3D: true, ease: "sine.out" }, 0)		
	// 		.to([this.closeMenu, this.links, this.bottomLinks], { y: 0, duration: 0.8, stagger: 0.045, force3D: true, ease: "expo.out" }, 0.1)
	// 		.to([this.closeMenu, this.links, this.bottomLinks], { autoAlpha: 1, duration: 0.78, stagger: 0.045, force3D: true, ease: "expo.out" }, 0.12)						
			
    // }

    // close() {
	// 	if (!this.isOpen) { return; }
	// 	this.isOpen = false;
    //     this.tl.clear();
    //     this.tl.progress(0);        
    //     this.tl
    //         .to([this.closeMenu, this.links, this.bottomLinks], { y: 20, duration: 0.15, force3D: true, ease: "sine.out" })
    //         .to([this.closeMenu, this.links, this.bottomLinks], { autoAlpha: 0, duration: 0.1, force3D: true, ease: "sine.out" }, 0)	
    //         .to(this.bg, { autoAlpha: 0, duration: 0.2, force3D: true, ease: "sine.out" }, 0)		
	// 		.set(this.navDrawer, { pointerEvents: "none", autoAlpha: 0 })            
    // }
}
