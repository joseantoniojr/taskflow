const nameTasks = "taskflow_tasks";
const nameProjects = "taskflow_projects";
const nameTags = "taskflow_tags";
const theme = "taskflow_settings";

function getTasks() {
	return JSON.parse(localStorage.getItem(nameTasks)) || [];
}

function saveTasks(tasks) {
	localStorage.setItem(nameTasks, JSON.stringify(tasks));
}

function getProjects() {
	return JSON.parse(localStorage.getItem(nameProjects)) || [];
}

function saveProjects(projects) {
	localStorage.setItem(nameProjects, JSON.stringify(projects));
}

function getTags() {
	return JSON.parse(localStorage.getItem(nameTags)) || [];
}

function saveTags(tags) {
	localStorage.setItem(nameTags, JSON.stringify(tags));
}
