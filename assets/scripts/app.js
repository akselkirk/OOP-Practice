class DOMHelper {
	static moveElement(elementId, newDestinationSelector) {
		const element = document.getElementById(elementId);
		const destinationElement = document.querySelector(newDestinationSelector);
		destinationElement.append(element);
	}

	static clearEventListners(element) {
		const clonedElement = element.cloneNode(true);
		element.replaceWith(clonedElement);
		return clonedElement;
	}
}

class Component {
	constructor(hostElementId, insertBefore = false) {
		if (hostElementId) {
			this.hostElement = document.getElementById(hostElementId);
		} else {
			this.hostElement = document.body;
		}
		this.insertBefore = insertBefore;
	}

	detach() {
		if (this.element) {
			this.element.remove();
		}
	}

	attach() {
		this.hostElement.insertAdjacentElement(
			this.insertBefore ? "afterbegin" : "beforeend",
			this.element
		);
	}
}

class ToolTip extends Component {
	constructor(closeNotifierFunction) {
		super();
		this.closeNotifier = closeNotifierFunction;
		this.create();
	}

	closeTooltip = () => {
		this.detach();
		this.closeNotifier();
	};

	create() {
		const tooltipElement = document.createElement("div");
		tooltipElement.className = "card";
		tooltipElement.textContent = "DUMMY";
		tooltipElement.addEventListener("click", this.closeTooltip);
		this.element = tooltipElement;
	}
}

class ProjectItem {
	hasActiveTooltip = false;

	constructor(id, updateProjectListsFunction, type) {
		this.id = id;
		this.updateProjectListsHandler = updateProjectListsFunction;
		this.connectSwitchButton();
		this.connectMoreInfoButton(type);
	}

	showMoreInfoHandler() {
		if (this.hasActiveTooltip === true) {
			return;
		}
		const tooltip = new ToolTip(() => {
			this.hasActiveTooltip = false;
		});
		tooltip.attach();
		this.hasActiveTooltip = true;
	}

	connectMoreInfoButton() {
		const projectItemElement = document.getElementById(this.id);
		const moreInfoBtn = projectItemElement.querySelector(
			"button:first-of-type"
		);
		moreInfoBtn.addEventListener("click", this.showMoreInfoHandler);
	}

	connectSwitchButton(type) {
		const projectItemElement = document.getElementById(this.id);
		let switchBtn = projectItemElement.querySelector(`button:last-of-type`);
		switchBtn = DOMHelper.clearEventListners(switchBtn);
		switchBtn.textContent = type === "active" ? "Finish" : "Activate";
		switchBtn.addEventListener(
			"click",
			this.updateProjectListsHandler.bind(null, this.id)
		);
	}

	update(updateProjectListFn, type) {
		this.updateProjectListsHandler = updateProjectListFn;
		this.connectSwitchButton(type);
	}
}

class ProjectList {
	moveHandler;
	type;
	projects = [];

	constructor(type) {
		this.type = type;
		const projectItems = document.querySelectorAll(`#${type}-projects li`);
		for (const projItem of projectItems) {
			this.projects.push(
				new ProjectItem(projItem.id, this.moveProject.bind(this), this.type)
			);
		}
		console.log(this.projects);
	}

	setMoveHandlerFunction(moveHandlerFunction) {
		this.moveHandler = moveHandlerFunction;
	}

	addProject(project) {
		this.projects.push(project);
		DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
		project.update(this.moveProject.bind(this), this.type);
	}

	moveProject(projectId) {
		// const projectIndex = this.projects.findIndex(p => p.id === project.id);
		// this.projects.splice(projectIndex, 1);
		this.moveHandler(this.projects.find((p) => p.id === projectId));
		this.projects = this.projects.filter((p) => p.id !== projectId);
	}
}

class App {
	static init() {
		const activeProjectsList = new ProjectList("active");
		const finishedProjectsList = new ProjectList("finished");
		activeProjectsList.setMoveHandlerFunction(
			finishedProjectsList.addProject.bind(finishedProjectsList)
		);
		finishedProjectsList.setMoveHandlerFunction(
			activeProjectsList.addProject.bind(activeProjectsList)
		);
	}
}

App.init();
