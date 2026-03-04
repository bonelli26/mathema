// if("scrollRestoration" in history){
// 	history.scrollRestoration = "manual";
// }

const eventMask = document.getElementById("event-mask");
eventMask.addEventListener('scroll', (e) => {
	e.stopPropagation()
	e.preventDefault()
});
eventMask.addEventListener('wheel', (e) => {
	e.stopPropagation()
	e.preventDefault()
});
eventMask.addEventListener('touchmove', (e) => {
	e.stopPropagation()
	e.preventDefault()
});

/*
	Init Routing
-------------------------------------------------- */
import "./routing";

/*
	Load Plugins / Functions
-------------------------------------------------- */
import { onReady, onLoad, onResize } from "./_global/_renderer";
import { globalStorage } from "./_global/storage";

/*
	Constants
-------------------------------------------------- */
const isMobile = require("ismobilejs");

globalStorage.isMobile = isMobile.any || ((/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream) || 'ontouchstart' in window;
if(globalStorage.isMobile) {
	document.getElementsByTagName('html')[0].classList.add('touch');
}

if (!globalStorage.isMobile && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
	document.getElementsByTagName('html')[0].classList.add('chrome');
}

/*
	Check for Reduced Motion changes
-------------------------------------------------- */
if(globalStorage.reducedMotion){
	window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", ()=>{
		globalStorage.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
}

/*
	Doc ready
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
	/* --- Fire onReady --- */
	onReady();
}, false);

/*
	Window onload
-------------------------------------------------- */
window.onload = function(){
	/* --- Fire onLoad --- */
	onLoad();
};

/*
	Window resize
-------------------------------------------------- */
let resizeTimeout = setTimeout(()=>{},0);

window.onresize = function(){

	/* --- Clear the timeout if actively resizing --- */
	clearTimeout(resizeTimeout);

	/* --- Delay resize event --- */
	resizeTimeout = setTimeout(()=>{
		/* --- Fire onResize --- */
		onResize();
	}, 250);
};

