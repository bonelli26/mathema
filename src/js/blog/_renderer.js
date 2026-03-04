import Highway from "@dogstudio/highway";
import {H} from "../routing";
import { gsap } from "gsap"
import {$scroll} from "../_global/_renderer";

/*
    View Events for Highway

	- Products Page
    - Events are listed in their execution order
-------------------------------------------------- */
class BlogRenderer extends Highway.Renderer{

	onEnter(){
		// console.log("onEnter");
	}

	onEnterCompleted(){
		// const allJournalCards = document.querySelectorAll(".journal-card");
		// const noPostsEl = document.getElementById("no-posts")
		// let bubbleString = "";
		//
		// const bubbleFiltersWrapper = document.getElementById("bubble-filters")
		// const bubbleFilters = bubbleFiltersWrapper.querySelectorAll("button")
		//
		// for (let i = 0; i < bubbleFilters.length; i++) {
		// 	const el = bubbleFilters[i];
		// 	const value = el.dataset.value;
		//
		// 	el.addEventListener("click", () => {
		// 		if (el.classList.contains("is-filled")) {
		// 			return;
		// 		}
		// 		bubbleFiltersWrapper.querySelector('.is-filled').classList.remove('is-filled');
		// 		el.classList.add('is-filled');
		// 		gsap.set(noPostsEl, { display: "none" })
		// 		if (value === "all") {
		// 			gsap.set(allJournalCards, { display: "block" })
		// 			bubbleString = ""
		// 		} else {
		// 			bubbleString = "."+value
		// 			const theseEls = document.querySelectorAll(bubbleString)
		// 			if (theseEls.length === 0) {
		// 				gsap.set(allJournalCards, { display: "none" })
		// 				gsap.set(noPostsEl, { display: "block" })
		// 			} else {
		// 				gsap.set(allJournalCards, { display: "none" })
		// 				gsap.set(theseEls, { display: "block" })
		// 			}
		// 		}
		//
		// 		$scroll.getScrolledMedia()
		// 		$scroll.checkScrolledMedia(true)
		// 	})
		// }

	}

	onLeave(){
		// console.log("onLeave");
	}

	onLeaveCompleted(){
		// console.log("onLeaveCompleted");
	}
}

export default BlogRenderer;
