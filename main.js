
// For milestone posting: 
// https://i.imgur.com/yFrM46O.png
// https://i.imgur.com/U6cLFNQ.png

const sw = true;
if (sw && navigator.onLine) {
		
	if ('serviceWorker' in navigator) {

		window.addEventListener('load', function() {
			navigator.serviceWorker.register("sw.js").then(reg => {}, err => {
				// console.log(err);
			});
		});
	}
} else if (!sw && navigator.onLine) {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			for (let registration of registrations) {
				registration.unregister();
			}
		});
	}
}	
function rld() {
	if(navigator.onLine) {
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			for (let registration of registrations) {
				registration.unregister();
			}
		});	
	}
	setTimeout(function() {
		location.reload();
	}, 500);
}

let urlVars = {};
let url = location.href;
url = url.split("#");
if(url[1]) {
	url[1] = url[1].split(/&|=/);
	runUrl();
}

function runUrl() {
	if(url[1].length > 0) {
		urlVars[url[1][0]] = url[1][1];
		url[1].splice(0, 2);
		runUrl();
	}
}

let end = false;
if(typeof urlVars.access_token !== "undefined") {
	localStorage.setItem("authorization", `${urlVars.token_type} ${urlVars.access_token}`);
	location.href = "/";
} else if(!localStorage.getItem("authorization")) {
	let node = document.querySelector(".auth");
	let content = document.importNode(node.content, true);
		
	document.querySelector(".below_top").classList.add("is_auth");
	document.querySelector(".below_top").innerHTML = "";
	document.querySelector(".below_top").appendChild(content);
	

	// if(confirm("Auth?")) {
	// 	// &scope=user:read%20notifications:write%20notifications:read%20tasks:read%20tasks:write
	// 	location.href = "https://api.getmakerlog.com/oauth/authorize/?client_id=OCjwS1j2z2XGc0aUZXBSYMyZOtCMLZFZ6UdwXGZA&response_type=token";
	// } 
}

let toRestart = true;
document.addEventListener("scroll", () => {
	scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	if(scrollTop < -100 && toRestart) {
		
		toRestart = false;

		let tab = localStorage.getItem("tab");
		if(tab == "timeline_c") {
			collections = {}
			show_collection_dates = [];
			load_url = init_load + "";
			load();
		} else if(tab == "notifications_c") {
			load_notifs();
		}

	} else if(!toRestart && scrollTop >= 0) {
		toRestart = true;
	}
});

let log_obj = {}
let people = {}

const empty_img = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const API = "https://api.getmakerlog.com/";
const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const default_options = {
	"type": "POST",
	"content-type": "application/json",
	"headers": {
		"Authorization": localStorage.getItem("authorization")
	}
}

function f(url, options = default_options) {
	options = {
		...default_options,
		...options
	}
	return new Promise((resolve, reject) => {
		fetch(API + url, options).then(data => {
			if(data.ok) {
				return data.json();
			} else {
				return data.statusText;
			}
		}).then(data => {
			if(typeof data == "string") {
				reject(data);
			} else {
				resolve(data);	
			}
			
		});
	});
}

function getDateStr(date) {
	// This function takes in a date object. (not string)
	// The desired return value is 01-01-1970 or DD-MM-YYYY.
	return `${(date.getDate()).toString().padStart(2, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getFullYear()}`
}
function getDateFromStr(str) {
	let tmp_date = str.split("-");
	let day = tmp_date[0];
	let month = tmp_date[1];
	let year = tmp_date[2];

	return new Date(`${day} ${months_long[Number(month - 1)]} ${year}`);
}

let event_icons = {
	"telegram": `<svg title="Telegram" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
	"github": `<svg title="Github" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
	"gitlab": `<svg title="Gitlab" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-gitlab"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path></svg>`,
	"webhook": `<svg title="Webook" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
	"trello": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trello"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="9"></rect><rect x="14" y="7" width="3" height="5"></rect></svg>`,
	"shipstreams": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-airplay"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg>`
}
let ad_urls = [];
let months_long = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let collections = {}
let show_collection_dates = [];
let log_arr = [];
let load_url = "explore/stream/";
// let load_url = "stream/";
let init_load = load_url + "";
window.onload = basic;
function basic() {
	load();
	load_notifs();
}

function load() {
	f(load_url).then(d => {

		let date_str = getDateStr(new Date(d.data[0].created_at));
		if(!show_collection_dates.includes(date_str)) {
			show_collection_dates.push(date_str);
		}

		d.data = run_data(d.data);

		load_timeline(log_arr);
		load_url = d.previous_url.slice(API.length);
		can_bottom = true;

		document.body.classList.add("body_loaded");

	});
}

function import_user(user_id, date) {
	return new Promise((resolve, reject) => {
		let date_obj = getDateFromStr(date);
		let day = date_obj.getDate();
		let month = date_obj.getMonth();
		let year = date_obj.getFullYear();
		if(day && month && year) {
			f(`users/${user_id}/stream/${year}/${months[month]}/${day}/`).then(d => {
				run_data(d.data);
				resolve(200);
			}).catch(err => {
				resolve(err);
			});
		} else {
			resolve(0);
		}
	});
}

function run_data(data) {
	data = data.sort((a, b) => {
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	data.forEach(log => {

		log.type = "log";

		log_obj[log.id] = log;
		
		let log_date = new Date(log.created_at);
		let log_date_str = getDateStr(log_date);

		if(!collections[log_date_str]) {
			collections[log_date_str] = {}
		}
		if(!collections[log_date_str][log.user.id]) {
			collections[log_date_str][log.user.id] = [];
		}

		let incl_alt = false;
		collections[log_date_str][log.user.id].forEach(i => {
			if(i.id == log.id) {
				incl_alt = true;
			}
		});
		if(!incl_alt) {
			collections[log_date_str][log.user.id].push(log);
		}

		let incl = false;
		log_arr.forEach(i => {
			if(i.id == log.id) {
				incl = true;
			}
		});
		if(!incl) {
			log_arr.push(log);
		}

		if(!people[log.user.id]) {
			people[log.user.id] = log.user;
		}
	});
	return data;
}

function load_timeline(data) {

	console.log(data);

	// Now the HTML.
	// Data is never used again.

	let timeline = document.querySelector(".timeline");
	if(!timeline) return 404;
	timeline.innerHTML = "";

	let tmp_arr_0 = Object.keys(collections);
	let tmp_arr_1 = [];
	let date_arr = [];
	tmp_arr_0.forEach(date_str => {
		date_arr.push(getDateFromStr(date_str));
	});
	date_arr = date_arr.sort((a, b) => {
		return b.getTime() - a.getTime();
	});
	date_arr.forEach(date_obj => {
		let str = getDateStr(date_obj);
		if(show_collection_dates.includes(str)) {
			tmp_arr_1.push(str);
		}
	});

	tmp_arr_1.forEach(date_str => {
		let users = collections[date_str];

		let ids = Object.keys(users);
		ids = ids.sort((a, b) => {
			return new Date(users[b][0].created_at).getTime() - new Date(users[a][0].created_at).getTime();
		});

		ids.forEach(user_id => {
			
			let arr = users[user_id];
			let showcase = arr[0];

			let content;
			if(showcase.type == "log") {
				content = get_log_div(showcase, date_str, arr);
			}

			timeline.appendChild(content);

		});
		timeline.appendChild(get_ad_div());
	});

	update_praised();
	update_comments();
	update_ads();
}

function get_comment_div(comment) {
	
	let node = document.querySelector(".comment_template");
	let content = document.importNode(node.content, true);
	content.querySelector(".comment_left img").src = comment.user.avatar;
	content.querySelector(".comment_right p").innerHTML = get_content_html(comment.content);
	
	let ago = new Date(comment.created_at);
	ago = Math.floor((new Date().getTime() - ago.getTime()) / 1000);
	let ago_str = "";
	if(ago < 60) {
		ago_str = ago + "s";
	} else if(ago < 3600) {
		ago_str = Math.floor(ago / 60) + "m";
	} else if(ago < 86400) {
		ago_str = Math.floor(ago / (60*60)) + "h";
	} else {
		ago_str = Math.floor(ago / (60*60*24)) + "d";
	}
	content.querySelector(".ago").innerHTML = ago_str;

	let name = comment.user.first_name + " " + comment.user.last_name;
	if(name.trim().length == 0) {
		name = "@" + comment.user.username;
	}
	content.querySelector(".name").innerHTML = name;

	return content;
}

function get_log_div(showcase, date_str = getDateStr(new Date()), arr = [], extra_class = "") {
	let node = document.querySelector(".log_template");
	let content = document.importNode(node.content, true);

	let person = people[showcase.user.id];

		content.querySelectorAll("*").forEach(el => {
			el.setAttribute("data-task-id", showcase.id);
		});

		content.querySelector(".log").setAttribute("data-thread-date", date_str);
		content.querySelector(".log").setAttribute("data-event", showcase.event);
		content.querySelector(".log .log_right").setAttribute("data-thread-date", date_str);
		content.querySelector(".log").setAttribute("data-user-id", person.id);
		content.querySelector(".log .log_right").setAttribute("data-user-id", person.id);
		extra_class.split(" ").forEach(cla => {
			if(cla.trim().length == 0) return 0;
			content.querySelector(".log").classList.add(cla);
		});

		let name = person.first_name + " " + person.last_name;
		if(name.trim().length == 0) {
			name = "@" + person.username;
		}
		content.querySelector(".name").innerHTML = name;
		content.querySelector(".log_main_content").innerHTML = get_content_html(showcase.content);
		content.querySelector(".profile_picture").src = person.avatar;

		content.querySelector(".lower_portion.comments span").innerHTML = showcase.comment_count;
		content.querySelector(".lower_portion.praise span").innerHTML = showcase.praise;
		content.querySelector(".lower_portion.more span").innerHTML = arr.length - 1;

		let state_icons = {
			"todo": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
			"done": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
			"in_progress": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
		}

		let state = "done";
		if(showcase.in_progress) {
			state = "in_progress";
		} else if(!showcase.done) {
			state = "todo";
		}

		content.querySelector(".lower_portion.state .portion_icon").innerHTML = state_icons[state];

		if(event_icons[showcase.event]) {
			content.querySelector(".lower_portion.event .portion_icon").innerHTML = event_icons[showcase.event];
		}

		if(typeof comments[showcase.id] !== "undefined") {
			comments[showcase.id] = comments[showcase.id].sort((a, b) => {
				return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			});
			comments[showcase.id].forEach(comment => {
				let comment_div = get_comment_div(comment);
				content.querySelector(".n_comments").appendChild(comment_div);
			});
		}

		if(praised[showcase.id] && praised[showcase.id].praise > 0) {
			content.querySelector(".praise svg").classList.add("praised");
		}

		if(showcase.attachment) {
			content.querySelector(".log_attachment").src = showcase.attachment;
		} else {
			content.querySelector(".log_attachment").remove();
		}

		let ago = new Date(showcase.created_at);
		ago = Math.floor((new Date().getTime() - ago.getTime()) / 1000);
		let ago_str = "";
		if(ago < 60) {
			ago_str = ago + "s";
		} else if(ago < 3600) {
			ago_str = Math.floor(ago / 60) + "m";
		} else if(ago < 86400) {
			ago_str = Math.floor(ago / (60*60)) + "h";
		} else {
			ago_str = Math.floor(ago / (60*60*24)) + "d";
		}
		content.querySelector(".ago").innerHTML = ago_str;

		return content;
}
function get_ad_div() {
	let node = document.querySelector(".log_template");
	let content = document.importNode(node.content, true);

	content.querySelector(".name").innerHTML = `A Maker Ad <div class="badge_ad">AD</div>`;
	content.querySelector(".ago").innerHTML = "";
	content.querySelector(".profile_picture").src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEsklEQVRYhcVXTUgbWxQ+HUOsBkLyaDdVCk6h0G4Kw1s/stJN4e1KVlIi3WWlxUWhpaVYoqhRCYYurAx2qWi6CPZBs1CEEGhBLRNqfFqZ/DKZjDHGzCSTe96iiY1xJj++Qr/VMPfce885937fOfcatAczAPxF0/RdhmH6rFarGQBAkqSTL1++HB4cHOwBwAYAnLS5bkNQANBvt9tZlmWlaDSaRR1Eo9Esy7KS3W5nAaC/Mvd/gRkaGvrIcVxBb1M9cBxXcDgcHwGAuVLUNE0P+/1+qd2N6+H3+yWapofbyYbBZrMt8DzfdtR64Hm+YLPZFgDA0DRym822kMlklFYWjsfjpf39/ZZsM5mMUnFCPxM0TQ+3E/mbN28El8sljoyM8KlUKt/Mnuf5QuU4fkZc8/2nx+N53tvbe73Vs7p586ZhYGCAMhgMlMlkMjaz7+3tve7xeJ6DxsWkHA7Hx1Yjr6JcLpdXVlayiqKU25lXYQcFAHCt4kA/x3G+e/fuaUZfKpXIu3fv0rIsE6PRaJRl+cxisXQPDg5aOjo6KACAz58/nwYCgePu7m4jAFCyLBedTueNzs7OS5kJh8Py/fv3/waAfwAAwG63s3reyrJcevHihSQIwoW7EY/HC0+fPo2oqoofPnwQfT7fJcoGg0Fpa2tLU7gqYgUAAGaWZXX5Pjc3l5AkqaQ1lkwmlbGxMd7r9Qp688fHx1PFYvHSES0uLgrwQ9rhYSN5nZqaiumNISI+fvw4dXp6qsucSCQirq+v5+r/R6PRLAA8pGiavtvT02OuPaODg4PjnZ2dYwCArq6uhqxwu91mk8mka3Pnzp0/vn//rtb/7+npMdM0fZdiGKavfjCXy8HZ2ZkRAEBRlLNGDlgsloYOxmKxk1u3bmlSlGGYPkO1pNbiwYMHluq3qqoGQgihKOpKlW1tbe3U4XDc0BqzWq3mpos+evTIsrS0lL7K5pIkqQBgrFBTE5QkSQ2bh9u3b18nhBj29/cbHkU9EJHMzMyknzx5YonFYnI8Hi9qOHgCNE0PN7rliIiEEHz16lUqnU5r0lELbrc7cXh4WEBE/PbtW25vb+8SE6p1QZeG8/PzwtzcXIwQgqVSCV+/fi0IgtDUCbfb/e/29nbDXqJKQwAdIVJVFZ1O5xHHcbnV1VUREbFUKuHLly/5o6MjzRKsqiq6XK4Ex3FNKyPLshJUhEhTit+/f58Nh8PZSCSSn56eTlX/E0Iwn8+XNzc3L6hfJpNRnj17FksmkwoiYigUyrndbt7n84laDtRKMcCPYnRBzRKJRGFycjK1vLycJYRcktJAIJCdnp5OFYvF8sbGRnZiYiJVLBbLhBD0eDzi+vq6iIj49u1bMZ/PX8gIx3EF+NG0/mTD0NBQ2+VYEITC2NiY8OnTp/M7FA6H8ysrK1lExN3d3ezo6GisXC5fCKC2HNeC+RVNKCJiIBAQEBFFUczPzs4masf8fr8Eep1yqy2ZIAiFUCikW8BEUcy7XK5EKBTKeb3e82Km1ZLVo6WmNJ1Ol79+/XqJ13U2SjAYVKr3p6WmtILf2pafZ+J3PkxqwTgcjt/yNLuQDWjjcbq4uCi08zi91sygDr/8ef4feYybN7HTQbwAAAAASUVORK5CYII=";

	content.querySelector(".log_lower").remove();
	content.querySelector(".log_comments").remove();
	content.querySelector(".log_attachment").src = empty_img;
	content.querySelector(".log_attachment").classList.add("maker_ad_attachment");
	content.querySelector(".profile_picture_div").removeAttribute("onclick");

	return content;
}

function update_ads() {
	let ad_imgs = document.querySelectorAll(".maker_ad_attachment");
	let promises = [];
	if(ad_imgs.length > ad_urls.length) {
		for(let i = 0; i < ad_imgs.length - ad_urls.length; i++) {
			promises.push(
				new Promise((resolve, reject) => {
					fetch("https://makerads.xyz/ad.json").then(d => {
						if(d.ok) {
							return d.json();
						} else {
							return null;
						}
					}).then(d => {
						resolve(d);
					});
				})
			)
		}
	}
	Promise.all(promises).then(d => {
		d.forEach(item => {
			if(item) {
				ad_urls.push(item);
			}
		});
		for(let i = 0; i < ad_imgs.length; i++) {
			ad_imgs[i].src = ad_urls[i].image;
			ad_imgs[i].setAttribute("onclick", `window.open("${ad_urls[i].url}", "_blank")`);
		}
	});
}

function update_praised() {
	return new Promise((resolve, reject) => {
		let arr = [];
		document.querySelectorAll(".log[data-task-id]").forEach(el => {
			arr.push(el.getAttribute("data-task-id"));
		});
		let promises = [];
		arr.forEach(id => {
			if(log_obj[id] && log_obj[id].praise > 0) {
				promises.push(f("tasks/" + id + "/can_praise/").then(d => {
					d.id = id;
					praised[id] = d;
				}).catch(err => {
					// Possibly, but not now
				}));
			}
		});
		Promise.all(promises).then(d_alt => {
			resolve(d_alt);
			render_praised();
		});
	});
}
function update_comments() {
	return new Promise((resolve, reject) => {
		let arr = Object.keys(log_obj);

		let promises = [];
		arr.forEach(id => {
			if(log_obj[id].comment_count > 0) {
				promises.push(f("tasks/" + id + "/comments/").then(d => {
					comments[id] = d;
				}).catch(err => {
					// Possibly, but not now
				}));
			}
		});
		Promise.all(promises).then(d_alt => {
			resolve(d_alt);
			render_comments();
		});
	});
}

function render_comments() {
	console.log("Rendering comments");
	Object.keys(comments).forEach(id => {
		document.querySelectorAll(`.comments[data-task-id="${id}"]`).forEach(el => {
			let c = comments[id].length;
			el.querySelector("span").innerHTML = c;
		});
	});
	if(typeof thread_opened !== "undefined" && localStorage.getItem("tab") == "log_thread") {
		open_thread(thread_opened[0], thread_opened[1], thread_opened[2], false);
	}
}
function render_praised() {
	Object.keys(praised).forEach(id => {
		if(praised[id].praise > 0) {
			document.querySelectorAll(`.praise svg[data-task-id="${id}"]`).forEach(el => {
				let praised_percentage = Math.floor(praised[id].praise);
				el.setAttribute("style", "--praise: " + praised_percentage + "%;");
				el.classList.add("praised");
			});
		} else {
			document.querySelectorAll(`.praise svg[data-task-id="${id}"]`).forEach(el => {
				let praised_percentage = Math.floor(praised[id].praise);
				el.setAttribute("style", "--praise: " + praised_percentage + "%;");
				el.classList.remove("praised");
			});
		}
		if(praised[id].can_praise == false) {
			document.querySelectorAll(`.praise svg[data-task-id="${id}"]`).forEach(el => {
				el.classList.add("no-praise");
			});
		}
	});
}


function get_content_html(str) {
	let words = str;

	let prefix = "";
	while(words.startsWith("#")) {
		prefix += "#";
		words = words.slice(1);
	}

	let converter = new showdown.Converter();
	showdown.setOption("noHeaderId", true);
	words = converter.makeHtml(words);
	
	words = words.trim().split(" ");
	for(let i = 0; i < words.length; i++) {
		let match = words[i].match(/https?:\/\//);
		if(match && match.index == 0) {

			let link = words[i];
			link = link.replace(/<\/p>/g, "");
			words[i] = `<a class="link" target="_blank" href="${link}">${words[i]}</a>`
		}
	}
	words = words.join(" ").slice(3);

	words = words.replace(/<\/h1>/g, "</p>");
	words = words.replace(/<h1>/g, "<p>#");
	
	return `<p>` + prefix + words;
}

let praised = {}
let comments = {}
if(localStorage.getItem("praised")) {
	praised = JSON.parse(localStorage.getItem("praised"));
}

function praise(id) {

	// console.log(id);
	document.querySelectorAll(`.praise[data-task-id="${id}"] svg`).forEach(el => {
		el.classList.add("beating");
	});
	f("tasks/" + id + "/praise/", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: localStorage.getItem("authorization")
		},
		body: JSON.stringify({
			amount: 10,
			increment: true
		})
	}).then(d => {
		document.querySelectorAll(`.praise[data-task-id="${id}"]`).forEach(el => {
			el.querySelector("svg").classList.add("praised");
			el.querySelector("svg").classList.remove("beating");
			el.querySelector("span").innerHTML = d.total;
			if(!praised[id]) {
				praised[id] = {
					praise: 0,
					can_praise: true,
					id: id
				}
			}
			praised[id].total = d.total;
			localStorage.setItem("praised", JSON.stringify(praised));
		});

		Object.keys(collections).forEach(date => {
			Object.keys(collections[date]).forEach(u_id => {
				collections[date][u_id].forEach(log => {
					if(log.id == id) {
						log.praise = d.total;
					}
				});
			});
		});

	}).catch(d => {
		console.log("Something went wrong while praising");
		document.querySelectorAll(".beating").forEach(el => {
			el.classList.remove("beating");
		});
	});

}

let scrollTop;
let scroll_v = {
	"timeline_c": 0,
	"notifications_c": 0,
	"search_c": 0
}
let can_bottom = true;
document.addEventListener("scroll", evt => {
	scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	scroll_v[localStorage.getItem("tab")] = scrollTop;

	if(isAtBottom() && can_bottom) {
		if(localStorage.getItem("tab") == "timeline_c") {
			// console.log("Loading more...");
			can_bottom = false;
			load();
		} else if(localStorage.getItem("tab") == "profile_c") {
			// console.log("Loading more user logs...");
			can_bottom = false;
			fetch_extra_profile();
		}
	}

});
function isAtBottom() {
	scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	return window.innerHeight + scrollTop >= document.querySelector(`.${localStorage.getItem("tab")}`).offsetHeight - screen.height*3;
}

function click_log(el, evt) {
	let path = evt.path || (evt.composedPath && evt.composedPath())
	let has_praise = typeof path !== "undefined" ? path.includes(el.querySelector(".praise")) : false;

	if(!has_praise && localStorage.getItem("tab") !== "log_thread") {
		open_thread(el.getAttribute("data-thread-date"), el.getAttribute("data-user-id"), el.getAttribute("data-index") || 0)
	}
}

let thread_opened;
function open_thread(date, user, thread_index = 0, should_animate = true) {
	if(!collections[date]) return 404;
	if(!collections[date][user]) return 404;

	let logs = collections[date][user];
	// console.log(logs);
	thread_opened = [date, user, thread_index];

	let el = document.querySelector(".log_thread .main");
	el.innerHTML = "";





	let sub_logs_div2 = document.createElement("div");
	sub_logs_div2.classList.add("sub_logs_div");
	sub_logs_div2.classList.add("sub_logs_div2");

	let to_add_infront = logs.slice(0, thread_index);
	if(to_add_infront.length == 1) {
		sub_logs_div2.classList.add("just_one_sub");
	} else if(to_add_infront.length == 0) {
		sub_logs_div2.classList.add("no_sub");
	}
	to_add_infront.forEach(log => {
		let sub_log_div = get_log_div(log, date, [0], "sub_log");
		sub_logs_div2.appendChild(sub_log_div);
	});


	el.appendChild(sub_logs_div2);





	let first_div = get_log_div(logs[thread_index], date, logs);
	first_div.querySelector(".log").setAttribute("id", "focused_div");
	el.appendChild(first_div);

	let sub_logs_div = document.createElement("div");
	sub_logs_div.classList.add("sub_logs_div");
	
	let to_add_after = logs.slice(thread_index + 1);
	if(to_add_after.length <= 1) {
		sub_logs_div.classList.add("just_one_sub");
	}
	to_add_after.forEach(log => {
		let sub_log_div = get_log_div(log, date, [0], "sub_log");
		sub_logs_div.appendChild(sub_log_div);
	});

	el.appendChild(sub_logs_div);

	setTab(["tab"], "log_thread", should_animate, should_animate);
	setTimeout(() => {
		// location.href = "#focused_div";
		scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		let sc = scrollTop - 41;
		if(scrollTop > 200) {
			window.scrollTo(0, scrollTop - 41);
		} else {
			window.scrollTo(0, 0); 
		}
	}, 4e2);
}

let touch = {
	isDoingStuff: false
}

let old_shown = false;

document.querySelectorAll(".swipeable").forEach(el => {
	el.addEventListener("touchstart", evt => {
		touch.startX = evt.touches[0].clientX;
		touch.fromTop = scrollTop;
	});
});

document.querySelectorAll(".swipeable").forEach(el => {
	el.addEventListener("touchmove", evt => {
		touch.currentX = evt.touches[0].clientX;
		touch.divX = touch.currentX - touch.startX;
		touch.percentage = touch.divX / (window.innerWidth / 100);
		if(!old_shown) {
			document.querySelector(`.${getPrevTab()}`).style.marginTop = "var(--gap)";
			document.querySelector(`.${getPrevTab()}`).style.display = "none";
		}
		if(touch.divX >= 50 /* Pixels from the initial touch X. */) {

			if(!old_shown /*&& getPrevTab() == "timeline_c"*/ && typeof scroll_v[getPrevTab()] !== "undefined") {
				let top = `calc(-${scroll_v[getPrevTab()]}px + ${document.querySelector('.top_most').scrollHeight}px)`;
				document.querySelector(`.${getPrevTab()}`).style.marginTop = top; 
				document.querySelector(`.${getPrevTab()}`).style.top = 0; 
				document.querySelector(`.${getPrevTab()}`).style.display = "flex";
				old_shown = true;
			}

			touch.isDoingStuff = true;
			document.querySelector(`.${el.getAttribute("data-class")}`).style.position = "fixed";
			document.querySelector(`.${el.getAttribute("data-class")}`).style.top = `calc((41px + env(safe-area-inset-top)) - ${touch.fromTop}px)`;
			document.querySelector(`.${el.getAttribute("data-class")}`).style.left = `${touch.divX - 50}px`;
		} else {
			document.querySelector(`.${el.getAttribute("data-class")}`).style.position = "absolute";
			document.querySelector(`.${el.getAttribute("data-class")}`).style.left = `0`;
			old_shown = false;
		}
	});
});

document.querySelectorAll(".swipeable").forEach(el => {
	el.addEventListener("touchend", evt => {
		old_shown = false;
		document.querySelector(`.${el.getAttribute("data-class")}`).style.position = "absolute";

		document.querySelector(`.${el.getAttribute("data-class")}`).style.left = `0`;
		document.querySelector(`.${el.getAttribute("data-class")}`).style.top = `auto`;
		
		if(touch.percentage > 100 / 3 /*% of the screen width*/) {
			setTab(["tab", "backupTab"], getPrevTab(), false);
		} else {
			if(touch.isDoingStuff) {
				window.scrollTo(0, touch.fromTop);	
			}
		}
		
		touch = {
			isDoingStuff: false
		}
	});
});

function send_comment(input_el) {
	let v = input_el.value;
	input_el.value = "";
	let id = input_el.getAttribute("data-task-id");
	f("tasks/" + id + "/comments/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem("authorization")
		},
		body: JSON.stringify({
			content: v
		})
	}).then(d => {
		f("tasks/" + id + "/comments/").then(d => {
			comments[id] = d;
			update_comments();
		}).catch(err => {
			// Possibly, but not now
		});
	});
}

let notifs = [];
let notif_obj = {}
let notif_fetching = {}
function load_notifs() {
	if(localStorage.getItem("authorization")) {
		f("notifications/").then(d => {
			// console.log(d);
			notifs = d;
			run_notifs(d).then(d => {
				render_notifs();
			});
		}).catch(err => {
			if(localStorage.getItem("authorization")) {
				localStorage.removeItem("authorization");
				location.reload();
			}
		});
	}
}

function run_notifs(d) {
	return new Promise((resolve, reject) => {

		let promises = [];

		d.forEach(notif => {
			if(!notif.target) {
				console.log("deleted");
				return;
			}
			let date = new Date(notif.target.created_at);
			if(!date) resolve(0);
			let date_str = getDateStr(date);

			notif_obj[notif.id] = notif;

			if(!collections[date_str]) {
				collections[date_str] = {}
			}
			let u_id = [notif.recipient.id, notif.actor.id];
			if(notif.target && notif.target.user && u_id.includes(notif.target.user.id)) {
				u_id.push(notif.target.user.id);
			}
			u_id.forEach(id => {
				// console.log("mark", notif.id, date_str, collections[date_str][id], notif_fetching[`${date_str} ${id}`]);
				if(!collections[date_str][id] && !notif_fetching[`${date_str} ${id}`]) {
					promises.push(import_user(id, date_str));
					notif_fetching[`${date_str} ${id}`] = true;
				} else {
					promises.push(new Promise((resolve, reject) => {
						resolve(0)
					}));
				}
			});
		});

		Promise.all(promises).then(d => {
			resolve(200);
			update_comments();
		});

	});
}

function render_notifs() {
	let div = document.querySelector(".notifications_c .notif_wrapper");
	div.innerHTML = "";
	notifs.forEach(notif => {

		if(!people[notif.actor.id]) {
			people[notif.actor.id] = notif.actor;
		}

		let onclick = "";

		let date = new Date(notif.target.created_at);
		let date_str = getDateStr(date);

		notif.verb = notif.verb.replace(/you are/g, "you're");

		let actor_name = `${notif.actor.first_name} ${notif.actor.last_name}`;
		if(actor_name.trim().length == 0) {
			actor_name = "@" + notif.actor.username;
		}

		let par = `${actor_name} ${notif.verb}`;

		let key = notif.key;
		if(notif.target) {
			if(key == "received_praise") {
				let tmp = get_ids(notif, date_str);
				onclick = `open_thread('${date_str}', ${tmp[1]}, ${tmp[0]})`
				par = `${actor_name} ${notif.verb}`;
			} else if(key == "followed") {
				onclick = `load_profile('${notif.actor.id}')`
				par = `${actor_name} ${notif.verb}`;
			} else if(key == "user_joined") {
				par = `Welcome to Makerlog!`;
			} else if(key == /*"thread_threaded"*/"thread_created") {
				par = `${actor_name} <a target="_blank" href="https://getmakerlog.com/discussions/${notif.target.slug}">${notif.verb}</a>`;
			} else if(key == "thread_replied") {
				par = `${actor_name} <a target="_blank" href="https://getmakerlog.com/discussions/${notif.target.slug}">${notif.verb}</a>`;
			} else if(key == "task_commented") {
				let id = notif.target ? notif.target.id : 1;
				let tmp = get_ids(notif, date_str);
				onclick = `open_thread('${date_str}', ${tmp[1]}, ${tmp[0]})`
				par = `${actor_name} ${notif.verb}`;
			} else if(key == "product_launched") {
				par = `${actor_name} <a target="_blank" href="https://getmakerlog.com/products/${notif.target.slug}">${notif.verb}</a>`;
			} else if(key == "product_created") {
				par = `${actor_name} <a target="_blank" href="https://getmakerlog.com/products/${notif.target.slug}">${notif.verb}</a>`;
			} else if(key == "user_mentioned") {
				let id = notif.target ? notif.target.id : 1;
				let tmp = get_ids(notif, date_str);
				onclick = `open_thread('${date_str}', ${tmp[1]}, ${tmp[0]})`
				par = `${actor_name} ${notif.verb}`;
			} else if(key == "mention_discussion") {
				par = `@${notif.actor.username} <a target="_blank" href="https://getmakerlog.com/task/${notif.actor.username}">${notif.verb}</a>`;
			}
		} else {
			par = "Content deleted.";
		}


		let node = document.querySelector(".notif_template");
		let content = document.importNode(node.content, true);

		content.querySelector(".profile_picture_div img").src = notif.actor.avatar;
		content.querySelector(".notif_p span").innerHTML = par;

		if(onclick.length > 0) {
			content.querySelector(".notif").setAttribute("onclick", onclick);
		}

		div.appendChild(content);
	});
}

function get_ids(notif) {
	let view_id = 0;
	let viewer_id = "";
	let date_str = getDateStr(new Date(notif.target.created_at));
	let u_id = [notif.actor.id, notif.recipient.id];
	
	if(!u_id.includes(notif.target.user.id)) {
		u_id.push(notif.target.user.id);
	}

	u_id.forEach(tmp_id => {
		if(collections[date_str] && collections[date_str][tmp_id]) {
			let index = 0;
			collections[date_str][tmp_id].forEach(tmp_log => {
				if(tmp_log.id == notif.target.id) {
					viewer_id = tmp_id;
					view_id = index;
				}
				index++
			});
		}
	});

	return [view_id, viewer_id];
}

function send_c(el) {
	send_comment(el); 
	el.blur()
}

function search(str) {
	if(str.length == 0) return;
	let loading = `
	<div class="loading_wrapper">
		<div class="loading"></div>
	</div>
	`
	document.querySelector(".search_tasks").innerHTML = loading;
	document.querySelector(".search_users").innerHTML = loading;
	console.log("[SEARCHING]", str);
	search_tasks(str);
	search_users(str);
}

function search_users(str) {
	return(f(`search/users/?q=${encodeURIComponent(str)}`).then(d => {
		let promises = [];
		d.results.forEach(result => {
			let date_str = getDateStr(new Date(result.item.created_at));
			let user = result.item.user;
			if(user) {
				promises.push(import_user(user.id, date_str));
			}
		});
		render_search_users(d.results);
	}));
}
function search_tasks(str) {
	return(f(`search/tasks/?limit=50&offset=0&q=${encodeURIComponent(str)}`).then(d => {
		let promises = [];
		d.results.forEach(result => {
			let date_str = getDateStr(new Date(result.item.created_at));
			let user = result.item.user;
			if(user) {
				promises.push(import_user(user.id, date_str));
			}
		});
		update_comments().then(() => {
			update_praised().then(alt => {
				render_search_tasks(d.results);
			});
		})
	}));
}


let current_profile = "";
function render_search_tasks(results) {
	let div = document.querySelector(".search_tasks");
	div.innerHTML = "";

	results = results.sort((a, b) => {
		let a_date = new Date(a.item.created_at).getTime();
		let b_date = new Date(b.item.created_at).getTime();
		return b_date - a_date;
	});

	results.forEach(result => {
		let log = result.item;
		let date_str = getDateStr(new Date(result.item.created_at));
		
		people[log.user.id] = log.user;

		div.appendChild(get_log_div(log, date_str, [0]));
	});

	console.log("Loaded.");
}
function render_search_users(results) {
	let div = document.querySelector(".search_users");
	div.innerHTML = "";

	console.log(results);

	results.forEach(person => {
		person = person.item;

		people[person.id] = person;

		let node = document.querySelector(".mini_user_template");
		let content = document.importNode(node.content, true);

		content.querySelector(".mini_pfp").src = person.avatar;
		content.querySelector(".mini_user").setAttribute("data-user-id", person.id);

		let sub = person.status || "";
		if(sub.length == 0) {
			sub = "@" + person.username;
		}
		content.querySelector(".status").innerHTML = sub;

		let name = person.first_name + " " + person.last_name;
		if(name.trim().length == 0) {
			name = "@" + person.username;
		}
		content.querySelector(".name").innerHTML = name;

		div.appendChild(content);
	});

	console.log("Loaded.");
}

function load_profile(id) {
	if(people[id]) {
		let p = people[id];

		let prf = document.querySelector(".profile_c");
		prf.querySelector(".profile_header_img").src = p.header;
		prf.querySelector(".profile_img").src = p.avatar;
		prf.querySelector(".profile_text h2").innerHTML = p.first_name + " " + p.last_name;
		prf.querySelector(".profile_text .username").innerHTML = p.username;
		prf.querySelector(".profile_logs").innerHTML = "";

		// Loading the logs.
		current_profile = p;
		p.logs = {}
		p.log_dates = [];
		p.last_url = "users/" + p.id + "/stream/";
		fetch_extra_profile();

		setTab(["tab"], "profile_c", true);

	} else {
		console.log("[PROFILE LOAD]", "Not found");
	}
}

function fetch_extra_profile() {
	f(current_profile.last_url).then(d => {
		console.log(d);
		if(d.previous_url) {
			current_profile.last_url = d.previous_url.slice(API.length);
		}
		let data = d.data;
		data.forEach(log => {
			let date_str = getDateStr(new Date(log.created_at));
			if(!current_profile.logs[date_str]) {
				current_profile.logs[date_str] = []
			}

			let can_add = true;

			current_profile.logs[date_str].forEach(alt_log => {
				if(alt_log.id == log.id) {
					can_add = false;
				}
			});

			can_add ? current_profile.logs[date_str].push(log) : "";
			
		});

		can_bottom = true;
		render_profile_logs();

	});
}

function render_profile_logs() {
	let div = document.querySelector(".profile_logs");
	div.innerHTML = "";

	let date_arr = Object.keys(current_profile.logs);
	date_arr = date_arr.sort((a, b) => {
		let a_date = getDateFromStr(a);
		let b_date = getDateFromStr(b);
		return b_date.getTime() - a_date.getTime();
	});

	date_arr.forEach(date_str => {
		let logs = current_profile.logs[date_str];
		logs.forEach(log => {
			let div_alt = get_log_div(log, "", [0]);
			div_alt.querySelector(".profile_picture_div").removeAttribute("onclick");
			div.appendChild(div_alt);
		});
	});

}

const default_filters = {
	"gitlab": true,
	"github": true,
	"telegram": true,
	"null": true,
	"webhook": true,
	"todoist": true,
	"trello": true,
	"shipstreams": true
}

init_filters();
function init_filters() {
	if(!localStorage.getItem("filters")) {
		localStorage.setItem("filters", JSON.stringify(default_filters));
	}
	let filters = JSON.parse(localStorage.getItem("filters"));
	Object.keys(filters).forEach(key => {
		let el = document.querySelector(`[data-filter-setting="${key}"]`);
		if(!el) return 404;
		if(filters[key] == true) {
			el.setAttribute("checked", true);
		} else {
			el.removeAttribute("checked");
		}
		document.body.setAttribute(`data-filter-${key}-setting`, filters[key]);
	});
}

function toggle_filter(which, checked) {
	let filters = JSON.parse(localStorage.getItem("filters"));
	filters[which] = checked;
	localStorage.setItem("filters", JSON.stringify(filters));
	init_filters();
}

function search_gifs(str) {
	let q = encodeURIComponent(str);
	// https://api.giphy.com/v1/gifs/search?api_key=x1uFeisfpQoHzLea5vVZ0myZ9R43RmIY&q=test&rating=g&limit=20&sort=relevant&offset=0&
	fetch(`https://api.giphy.com/v1/gifs/search?api_key=JrCU6wLCIsOfVkSI8CwsLjIRGzhVORwF&q=${q}&rating=g&limit=24&sort=relevant&offset=0`).then(d => {
		return d.json();
	}).then(d => {
		console.log(d);
		let div = document.querySelector(".search_gif_content");
		div.innerHTML = "";
		d.data.forEach(obj => {
			div.innerHTML += `
				<img src="${obj.images.downsized.url}" onclick="reply_with_gif(this.src)">
			`
		});
	});
}

function reply_with_gif(source) {
	toggle_gif_overlay();
	let id = gif_reply_id + "";
	f("tasks/" + id + "/comments/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem("authorization")
		},
		body: JSON.stringify({
			content: `![gif](${source})`
		})
	}).then(d => {
		f("tasks/" + id + "/comments/").then(d => {
			comments[id] = d;
			update_comments();
		}).catch(err => {
			// Possibly, but not now
		});
	});
}

function toggle_gif_overlay() {
	document.querySelector(".gif_overlay").classList.toggle("overlay_visible");
}
let gif_reply_id = 1;
function gif_click(id) {
	search_gifs("Good job");
	gif_reply_id = id;
	toggle_gif_overlay();
}

function reveal_alt_auth() {
	document.querySelector(".auth_card").classList.add("reveal_alt");
}

function auth(un, pw) {
	fetch(API + "api-token-auth/", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({
			username: un,
			password: pw
		})
	}).then(d => {
		return d.json();
	}).then(d => {
		document.querySelector(".auth_error").innerHTML = "";
		if(d.token) {
			localStorage.setItem("authorization", `token ${d.token}`);
			location.reload();
		} else {
			console.log(d);
			d.non_field_errors.forEach(error => {
				document.querySelector(".auth_error").innerHTML += `
					<p class="error">${error}</p>
				`
			});
		}
	});
}