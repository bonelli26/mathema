import Highway from "@dogstudio/highway";
import {H} from "../routing";
import {$miniCart} from "../_global/_renderer";

/*
    View Events for Highway

	- Home Page
    - Events are listed in their execution order
-------------------------------------------------- */
class CartRenderer extends Highway.Renderer {

	onEnter() {
		window.location = window.location.origin + "?cart=true";
	}

	onEnterCompleted() {

	}

	onLeave() {

	}

	onLeaveCompleted() {

	}
}

export default CartRenderer;
