function change_header(str) {
	document.querySelector("header h3").classList.add("headerFade");
	let time = 400;
	setTimeout(() => {
		document.querySelector("header h3").innerHTML = str;
	}, time / 2);
	setTimeout(() => {
		document.querySelector("header h3").classList.remove("headerFade");
	}, time);
}