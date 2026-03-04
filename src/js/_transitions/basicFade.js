import {$megaNav, $mobileMenu} from "../_global/_renderer";
import Highway from "@dogstudio/highway";
import { gsap } from "gsap";
import {domStorage, globalStorage} from "../_global/storage";


/*
	Default Highway Transition
-------------------------------------------------- */
class BasicFade extends Highway.Transition{

	out({from, trigger, done}){
		if ($megaNav.isOpen) {
			$megaNav.close()
		}
		if ($mobileMenu.isOpen) {
			$mobileMenu.close()
		}
		gsap.to(domStorage.header, { y: 0, opacity: 1, pointerEvents: 'all', ease: 'sine.out', duration: 0.2, force3D: true });
		done();
	}

	in({from, to, trigger, done}){

		globalStorage.namespace = to.dataset.routerView;
		// Move to top of page
		window.scrollTo(0, 0);

		// Remove old view
		from.remove();
		globalStorage.transitionFinished = true;

		done();
	}
}

export default BasicFade;
