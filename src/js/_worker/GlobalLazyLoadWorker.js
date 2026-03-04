import { gsap } from "gsap";
import {globalStorage} from "../_global/storage";

export class GlobalLazyLoadWorker {

	constructor(specialWorker, options = {}){

		this.worker = new Worker( window.workerUrl );
		this.array = [];
		this.domElements = false;
		this.loadingImages = false;
		this.count = 0; // How many images have finished their lazyload
		this.sent = 0; // How many images have been sent to lazyload
		this.total = 0; // Count of images requested to lazyload
		this.break = false
		/* --- Grab our options --- */
		this.callbackCap = (typeof options.callbackCap === "undefined") ? 1000000 : parseInt(options.callbackCap); // Max Images to load before firing callback
		this.dataAttr = (typeof options.dataAttr === "undefined") ? "preload" : options.dataAttr; // What data attribute to use
		this.forceNoWorker = (typeof options.forceNoWorker === "undefined") ? false : options.forceNoWorker; // Force lazy load to not use the worker
		this.size = globalStorage.isGreaterThan767 ? "desktop" : "mobile"; // Data attribute size, data-preload-{size}
		this.tagExclusions = (typeof options.tagExclusions === "undefined") ? ["audio", "iframe", "video"] : options.tagExclusions; // Which html tags to exclude from worker load
		this.workerCap = (typeof options.workerCap === "undefined") ? 1000000 : parseInt(options.workerCap); // How many images to blob before moving back to traditional load
		this.delay = (typeof options.delay === "undefined") ? false : parseInt(options.delay); // Time in milleseconds to force load

		/* --- Bind our worker events --- */
		this.bindEvents();
	}

	bindEvents(){

		/* --- Setup our listener for the worker --- */
		this.worker.addEventListener("message", (event)=>{

			const data = event.data;
			let url = URL.createObjectURL(data.blob);
			/* --- Let's update our array key --- */
			this.array[data.url] = url;
			if(this.domElements){
				/* --- Make sure we get elements that might have duplicate images --- */
				if (data.url.indexOf('localhost') >= 0) {
					data.url = data.url.replace("https://fake-quentin.myshopify.com", "");
				}
				let images = document.querySelectorAll(`[data-${this.dataAttr}-${this.size}="${data.origUrl}"]`);
				for(let i = 0; i < images.length; i++){
					this.preload(images[i], url);
				}

			} else {
				if (data.url.indexOf('localhost') >= 0) {
					data.url = data.url.replace("https://fake-quentin.myshopify.com", "");
				}
				let images = document.querySelectorAll(`[data-${this.dataAttr}-${this.size}="${data.origUrl}"]`);
				for(let i = 0; i < images.length; i++){
					this.preload(images[i], url);
				}
				this.returnedUrls.push(url);
				this.count++;
			}
		});
	}

	cancelAndLeave() {

	}

	remove(array, key) {
		return array.filter(e => e !== key);
	}

	/* --- Load a single image --- */
	loadImage(element){

		let url = element.getAttribute(`data-${this.dataAttr}-${this.size}`);

		if(this.array[url] !== undefined && this.array[url] !== ""){
			this.preload(element, this.array[url]);
		}
	}

	/* --- Load an array of images --- */
	loadImages(images = [], context, callback, criticalGroup = false){
		this.count = this.loadingImages ? this.count : 0;
		this.total = this.loadingImages ? this.total + images.length : images.length;

		this.loadingImages = true;
		/* --- Check against selector instead of array --- */
		if (context === "string") {
			images = document.querySelectorAll(images);
			this.domElements = true;
		}

		if (context === "nodeList") {
			this.domElements = true;
		}

		if (context === "array") {
			this.domElements = false;
			this.returnedUrls = [];
		}

		let protocol = window.location.protocol + "//";
		/* --- Loop through our images --- */
		for(let i = 0; i < images.length; i++){
			if (this.break) {
				this.loadingImages = false;
				break;
			}
			let url;
			let tag;

			if (this.domElements) {
				url = images[i].getAttribute(`data-${this.dataAttr}-${this.size}`);
				tag = images[i].tagName.toLowerCase();
			} else {
				url = images[i];
			}
			const origUrl = url;
			if (url && !url.includes('https')) {
				if (!url.includes('//')) {
					url = 'https://fake-quentin.myshopify.com' + url;
				} else {
					url = 'https:' + url;
				}
			}
			/* --- Blank URLs should be passed --- */
			if(!url || url === "" || url.includes("Liquid error")){

				// this.clearElement(images[i]);
				this.total--;

				continue;
			}

			/* --- Duplicates should be passed, but not subtracted --- */
			if(this.array[url] !== undefined && this.array[url] === "") {
				this.total--;
				continue;
			}

			/* --- Hey, we've loaded this image previously... load then skip --- */
			if(this.array[url] !== undefined && this.array[url] !== ""){

				if(!this.domElements){
					let thisUrl = this.array[url];
					if (thisUrl.indexOf('localhost') >= 0) {
						thisUrl = thisUrl.replace("https://fake-quentin.myshopify.com", "");
					}
					const origUrl = url.replace("https://fake-quentin.myshopify.com", "")
					let images = document.querySelectorAll(`[data-${this.dataAttr}-${this.size}="${origUrl}"]`);
					for(let i = 0; i < images.length; i++){
						this.preload(images[i], thisUrl);
					}
					this.returnedUrls.push(this.array[url]);
				} else {
					this.preload(images[i], this.array[url]);
				}

				this.total--;

				continue;
			}

			/* --- Don't send the URL to the worker --- */
			if(this.domElements && (this.forceNoWorker === true || this.tagExclusions.indexOf(tag) >= 0 || this.sent >= this.workerCap) || url.indexOf('.gif') > 0){

				/* --- Traditional non-worker Load --- */
				this.preload(images[i], url);

				continue;
			}

			/* --- Send the url over to the worker --- */
			this.array[url] = "";
			this.sent++;

			this.message({url, origUrl});
		}

		/* --- Set our callback interval --- */
		let timeout = setTimeout(()=>{});
		let interval = setInterval(()=>{
			if(this.count >= this.total || this.count >= this.callbackCap){
				clearInterval(interval);
				this.loadingImages = false;
				if (!this.domElements) {
					callback(this.returnedUrls);
				} else {
					callback(this.count + " elements loaded, " + (this.count - this.total) + " duplicate elements");
				}
			}
		}, 10);

		if(this.delay && this.delay !== false){
			timeout = setTimeout(()=>{
				clearInterval(interval);
				this.loadingImages = false;
				callback(this.count + " elements loaded, forced after " + this.delay + " milleseconds");
			}, this.delay);
		}
	}

	/* --- Detect tag and load accordingly --- */
	preload(element, url){

		let tag = element.tagName.toLowerCase();

		switch(tag){

			/* --- Source --- */
			case "audio":
			case "video":

				this.loadSource(element, url);

				break;

			/* --- SVG Image Tags --- */
			case "image":

				this.loadSVGImage(element, url);

				break;

			/* --- Src --- */
			case "iframe":
			case "img":

				this.loadSrc(element, url);

				break;

			/* --- Background-image --- */
			default:

				this.loadBackgroundImage(element, url);

				break;
		}
		this.clearElement(element);

	}

	/* --- Load url into child source element --- */
	loadSource(element, url){

		let source = document.createElement("source");

		source.setAttribute("src", url);

		element.appendChild(source);
		element.load();

		let checkVideoLoad = setInterval(()=>{

			if(element.readyState > 3){

				/* --- Video has loaded --- */
				this.count++;

				clearInterval(checkVideoLoad);
			}

		}, 10);
	}

	/* --- Load url into src attribute --- */
	loadSrc(element, url){
		this.count++;
		element.setAttribute("src", url);
	}

	loadSVGImage(element, url){

		element.onload = ()=>{

			this.count++;
		};

		element.onerror = ()=>{
			this.count++;
		};

		element.setAttribute("href", url);
	}

	/* --- Load url into background-image --- */
	loadBackgroundImage(element, url){

		let image = new Image();

		image.onload = ()=>{
			element.style.backgroundImage = "url(" + url + ")";
			this.count++;
		};

		image.onerror = ()=>{
			this.count++;
		};

		image.src = url;
	}

	/* --- Remove selectors and urls --- */
	clearElement(element){

		if(!element) return;
		//
		// element.removeAttribute("data-preload-desktop");
		// element.removeAttribute("data-preload-mobile");
		if (element.classList.contains("preload-critical") || element.classList.contains("preload")) {
			//element.removeAttribute("srcset");
			element.classList.add("loaded");
		}
	}

	/* --- Clear single blob --- */
	clearBlob(url){

		if(!this.array[url]) return;

		URL.revokeObjectURL(this.array[url]);

		this.remove(this.array, url);
	}

	/* --- Remove all blobs from memory --- */
	clearAllBlobs(){

		for(let i = 0; i < this.array.length; i++){
			URL.revokeObjectURL(this.array[i]);
		}

		this.array = [];
	}

	/* --- Post our message to the worker --- */
	message(message){
		this.worker.postMessage(message);
	}
}
