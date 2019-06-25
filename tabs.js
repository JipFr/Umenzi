var topHeightThing = 0;
var scrollV = {};
shouldAni = false;
const secondary_tabs = ["log_thread", "profile_c"];

setTimeout(function() {
	if(document.querySelector(".container")) {
		topHeightThing = document.querySelector('.container.shown').offsetTop;
	}
}, 200);

if(typeof defaultTab == 'undefined') {
	defaultTab = "home";
}

tabFrame();
function tabFrame() {
	requestAnimationFrame(tabFrame);
	scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	scrollV[localStorage.getItem('tab')] = scrollTop;
}

if(localStorage.getItem('tab') == null) {
	localStorage.setItem('tab', defaultTab)
	localStorage.setItem('backupTab', defaultTab)
} else {
	localStorage.setItem('tab', localStorage.getItem('backupTab'))
}

document.querySelector('body').innerHTML += `
	<style class="tabStyle">
		.containers {
			width: 100%;
			overflow-x: hidden;
		}
		.container {
			display: none;
			position: absolute;
			flex-wrap: wrap; 
			align-items: flex-start;
			min-height: calc(100vh - env(safe-area-inset-top) - var(--gap) - var(--gap) - 41px - 5px);
		}
		.slideIn {
			position: fixed;
			display: flex;
			align-items: flex-start;
			animation: slideInAni 500ms 1;
		}
		@keyframes slideInAni {
			from {
				transform: translate3d(100vw, 0, 0);
			}
			to {
				transform: translate3d(0, 0, 0);
			}
		}
		.container.shown {
			display: grid;
			align-content: flex-start;
			grid-template-rows: auto 1fr;
		}
	</style>
`

const title_changes = {
	"timeline_c": "Timeline",
	"notifications_c": "Notifications",
	"search_c": "Search",
	"settings_c": "Settings",
	"log_thread": "Thread",
	"profile_c": "Profile"
}

let path_history = [localStorage.getItem("tab")];
let should_scroll = true;
updateTab(false);
function updateTab(shouldAni, sc = true) {

	let to = localStorage.getItem("tab");
	let current_title = document.querySelector("header h3").innerHTML;
	if(title_changes[to] && current_title !== title_changes[to]) {
		change_header(title_changes[to]);
	}

	if(screen.width >= 676) {
		shouldAni = false;
	}

	should_scroll = sc;

	document.querySelectorAll(".nav_item").forEach(el => {
		el.classList.remove("nav_focus")
	});
	let tmp_nav = document.querySelector(`.nav_item[data-tab="${localStorage.getItem('backupTab')}"]`)
	if(tmp_nav) {
		tmp_nav.classList.add("nav_focus");
	}

	var tab = localStorage.getItem('tab');
	var backup = localStorage.getItem('backupTab');
	var containers = document.querySelectorAll('.container');

	if(shouldAni) {
		var containers = document.querySelectorAll('.container');
		for(var i = 0; i < containers.length; i++) {
			containers[i].style.zIndex--
			containers[i].style.position = "fixed";
			containers[i].style.top = `calc(41px + env(safe-area-inset-top) - ${scrollV[getPrevTab()]}px)`;
		}
		document.querySelector(`.${tab}`).style.top = "calc(env(safe-area-inset-top) + 41px)";
		document.querySelector(`.${tab}`).style.zIndex = "400";
		document.querySelector(`.${tab}`).classList.add('slideIn');
		
		document.querySelector(`.${tab}`).addEventListener("webkitAnimationEnd", cssEnd);
		document.querySelector(`.${tab}`).addEventListener("animationend", cssEnd);
	} else {
		hideAll();
		document.querySelector(`.${tab}`).style.position = "initial";
		document.querySelector(`.${tab}`).style.top = "calc(env(safe-area-inset-top) + 41px)";
		document.querySelector(`.${tab}`).style = "z-index: 400";
		document.querySelector(`.${localStorage.getItem('tab')}`).classList.add('shown');

		scroll();

	}
	if(localStorage.getItem("tab") !== getPrevTab()) {
		localStorage.setItem("getPrevTab()", getPrevTab());

	}
	
}

function getPrevTab() {
	let r = "";
	if(path_history.length > 1) {
		r =  path_history[path_history.length - 2];
	} else {
		r =  path_history[0];
	}
	return r;
}

function scroll() {
	if(!should_scroll) console.log("Don't scroll");
	if(!should_scroll) return;
	if(typeof scroll_v !== "undefined" && /*localStorage.getItem('tab') == "timeline_c"*/ !secondary_tabs.includes(localStorage.getItem("tab")) && scroll_v[localStorage.getItem('tab')]) {
		window.scrollTo(0, scroll_v[localStorage.getItem('tab')]);
	} else {
		window.scrollTo(0, 0);
	}
}

function setTab(whatfor, to, ani, scroll = true) {

	console.log("Setting tab");

	if(secondary_tabs.includes(to)) {
		document.querySelector(".go_back").classList.add("show_go_back");
		if(scroll) {
			document.querySelector(".go_back p").innerHTML = title_changes[localStorage.getItem("tab")];
		}
		if(path_history.includes(to)) {
			path_history.pop();
		} else {
			path_history.push(to);
		}
	} else {
		path_history = [to];
		document.querySelector(".go_back").classList.remove("show_go_back");
	}

	topHeightThing = document.querySelector('.container.shown').offsetTop;

	whatfor.forEach(function(f) {
		localStorage.setItem(f, to);
	});
	updateTab(ani, scroll);
}

function cssEnd() {
	let tab = localStorage.getItem('tab');
	tab = document.querySelector(`.${tab}`);
	if(tab && JSON.stringify(tab.classList).indexOf("slideIn") > -1) {
		hideAll();
		tab.classList.remove('slideIn');
		tab.style.position = "initial";
		tab.classList.add('shown');
		tab.style = "z-index: 400";
	}

	scroll();

}

function hideAll() {
	var containers = document.querySelectorAll('.container');
	for(var i = 0; i < containers.length; i++) {
		containers[i].classList.remove('shown'); 
		containers[i].style.zIndex--;
		containers[i].style.position = "fixed";
		containers[i].style.top = topHeightThing + -scrollV[getPrevTab()] + "px"
	}
}