import Highway from "@dogstudio/highway";
import { AddToCart } from "../_extensions/Shopify/AddToCart";
import {$scroll} from "../_global/_renderer";
import {gsap} from "gsap";
import {globalStorage} from "../_global/storage";
import {prepSliders, stickyPdpDrawer} from "../_global/anims";
import {H} from "../routing";

/*
    View Events for Highway

	- Products Page
    - Events are listed in their execution order
-------------------------------------------------- */
class ProductsRenderer extends Highway.Renderer{

	onEnter(){
		// console.log("onEnter");
		console.log(globalStorage.firstLoad)

	}

	onEnterCompleted() {
		// const productRecommendationsSection = document.getElementById('recommended-products');
		// const sectionParent = productRecommendationsSection.parentElement
		// const url = window.location.origin + productRecommendationsSection.dataset.url;
		// fetch(url)
		// 	.then(response => response.text())
		// 	.then(text => {
		// 		// console.log(text)
		// 		sectionParent.innerHTML = text
		// 		H.attach(sectionParent.querySelectorAll("a"))
		// 		if ($scroll) {
		// 			$scroll.getScrolledMedia()
		// 		}
		// 		sectionParent.querySelector('.slider').classList.remove('wait')
		// 		prepSliders()
		// 	})
		// 	.catch(e => {
		// 		console.error(e);
		// 	});


		const thumbnails = document.querySelectorAll(".thumbnails-wrapper .thumbnail")
		const mainImage = document.getElementById("main-image")
		const event = globalStorage.isMobile ? "click" : "mouseenter"
		for (let i = 0; i < thumbnails.length; i++) {
			const el = thumbnails[i]
			el.addEventListener(event, () => {
				if (el.classList.contains("active")) { return }
				document.querySelector(".thumbnail.active").classList.remove("active")
				el.classList.add("active")
				gsap.to(mainImage, { autoAlpha: 0, ease: "sine.out", duration: .22, force3D: true, onComplete: () => {
						mainImage.src = el.querySelector("img").src
						gsap.to(mainImage, { autoAlpha: 1, ease: "sine.inOut", duration: .25, force3D: true })
					} })
			})
		}
		if (!globalStorage.firstLoad) {
			(document.querySelectorAll(".jdgm-widget, .jdgm-all-reviews-page").length > 0) && window.jdgm.loadJS(window.jdgm.CDN_HOST + "loader.js")
		}
	}

	onLeave(){
		// console.log("onLeave");
	}

	onLeaveCompleted(){
		// console.log("onLeaveCompleted");
	}
}

export default ProductsRenderer;
