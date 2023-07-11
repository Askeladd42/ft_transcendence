//import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

alert('test subject');

function formatName(usr) {
	return usr.firstName + ' ' + usr.lastName;
}

const usr = {
	firstName: 'Larry', lastName: 'Lafair'
};

//const elm =<h1>Bonjour, {formatName(usr)} !</h1>;

class	NameDisplay extends React.Component {
	render() {
		return React.createElement('div', {className: 'name-display'},
		React.createElement('h1', 'Bonjour, {formatName(usr)} !'),
		React.createElement('ul', formatName(usr))
		);
	}
}

//button replacement

const	btn1 = document.querySelector("#btn-1");
const	btn2 = document.getElementById("btn-2");
const	response = document.querySelector("p");
const	questionContainer = document.querySelector(".click-event");

// click event
questionContainer.addEventListener("click", () => {
	questionContainer.classList.toggle("question-clicked");
});

btn1.addEventListener("click", () => {
	response.classList.add("show-response");
	response.style.background = "green";
});

btn2.addEventListener("click", () => {
	response.classList.add("show-response");
	response.style.background = "red";
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NameDisplay />);