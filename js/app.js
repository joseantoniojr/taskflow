let pendingDeleteId;
let pendingDeleteType;

document.addEventListener("DOMContentLoaded", () => {
	const media = window.matchMedia("(width < 768px)");
	init();
});

function init() {
	carregarTema();

	renderTasks();
	renderProjects();
	renderTags();

	configNavigation();
	configHamburger();

	configSearch();
	configModais();
	configForm();
	configAction();

	lucide.createIcons();
}

function carregarTema() {
	const btnToggleTheme = document.querySelector("#btn-toggle-theme");

	let currentTheme = getTheme() || "light";

	document.documentElement.setAttribute("data-theme", currentTheme);

	btnToggleTheme.addEventListener("click", () => {
		currentTheme = currentTheme === "dark" ? "light" : "dark";

		document.documentElement.setAttribute("data-theme", currentTheme);

		saveTheme(currentTheme);
	});
}

function configNavigation() {
	const links = document.querySelectorAll("[data-page]");
	const pages = document.querySelectorAll(".page");

	links.forEach((item) => {
		item.addEventListener("click", () => {
			const currentActive = document.querySelector(".sidebar__link.active");
			if (currentActive) currentActive.classList.remove("active");

			const pageName = item.dataset.page;
			pages.forEach((section) => {
				if (section.id === "page-" + pageName) {
					section.classList.add("page--active");
				} else {
					section.classList.remove("page--active");
				}
			});

			item.classList.add("active");
		});
	});
}

function configHamburger() {
	const btnHamburger = document.querySelector("#btn-hamburger");
	const sidebar = document.querySelector("#sidebar");
	const overlay = document.querySelector("#sidebar-overlay");
	const navLinks = document.querySelectorAll(".sidebar__link");

	btnHamburger.addEventListener("click", () => {
		sidebar.classList.add("open");
		overlay.classList.add("visible");
		overlay.removeAttribute("hidden");
	});

	overlay.addEventListener("click", () => {
		sidebar.classList.remove("open");
		overlay.hidden = true;
		overlay.classList.remove("visible");
	});

	navLinks.forEach((link) => {
		link.addEventListener("click", () => {
			sidebar.classList.remove("open");
			overlay.hidden = true;
			overlay.classList.remove("visible");
		});
	});
}

function search(termo) {
	termo = termo.trim().toLowerCase();

	if (termo === "") {
		renderTasks();
		renderProjects();
		return;
	}

	const tasks = getTasks().filter((task) => task.titulo.toLowerCase().includes(termo));
	const projects = getProjects().filter((project) => project.nome.toLowerCase().includes(termo));

	console.log(tasks);
	console.log(projects);
}

function configSearch() {
	const searchDesk = document.querySelector("#input-global-search");
	const searchMobile = document.querySelector("#input-mobile-search");
	let timer;

	searchDesk.addEventListener("input", (e) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			search(e.target.value);
		}, 300);
	});

	searchMobile.addEventListener("input", (e) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			search(e.target.value);
		}, 300);
	});
}

function configAction() {
	const dashboardList = document.querySelector("#dashboard-task-list");
	const taskList = document.querySelector("#task-list");
	const projectList = document.querySelector("#project-list");
	const tagList = document.querySelector("#tag-list");

	[taskList, dashboardList].forEach((container) => {
		container.addEventListener("click", (e) => {
			if (e.target.type === "checkbox" && e.target.name === "task") {
				const tr = e.target.closest("tr");
				toggleComplete(tr.dataset.taskId);
				return;
			}

			const btn = e.target.closest("[data-action]");
			if (!btn) return;

			const tr = e.target.closest("tr");
			if (!tr) return;

			const id = tr.dataset.taskId;
			const action = btn.dataset.action;

			if (action === "edit") openModalTask(id);
			if (action === "delete") {
				pendingDeleteId = id;
				pendingDeleteType = "task";
				openModal("modal-confirm");
			}

			if (action === "favorite") toggleFavorite(id);
		});
	});

	projectList.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;

		const tr = e.target.closest("tr");
		if (!tr) return;

		const id = tr.dataset.projectId;
		const action = btn.dataset.action;

		if (action === "edit") openModalProject(id);
		if (action === "delete") {
			pendingDeleteId = id;
			pendingDeleteType = "project";
			openModal("modal-confirm");
		}
	});

	tagList.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-action]");
		if (!btn) return;

		const tr = e.target.closest("tr");
		if (!tr) return;

		const id = tr.dataset.tagId;
		const action = btn.dataset.action;

		if (action === "edit") openModalTag(id);
		if (action === "delete") {
			pendingDeleteId = id;
			pendingDeleteType = "tag";
			openModal("modal-confirm");
		}
	});
}

function readTagsSelected(containerId) {
	const container = document.querySelector("#" + containerId);
	const spans = container.querySelectorAll(".tags-select__item.selected");
	const result = Array.from(spans).map((item) => item.dataset.tagId);

	return result;
}

function configForm() {
	const formTask = document.querySelector("#form-task");
	const formProject = document.querySelector("#form-project");
	const formTag = document.querySelector("#form-tag");
	const btnConfirmDelete = document.querySelector("#btn-confirm-delete");

	formTask.addEventListener("submit", (e) => {
		e.preventDefault();

		const id = document.querySelector("#input-task-id").value;

		const dados = {
			titulo: document.querySelector("#input-task-title").value.trim(),
			descricao: document.querySelector("#input-task-description").value.trim(),
			prazo: document.querySelector("#input-task-deadline").value,
			prioridade: document.querySelector("#select-task-priority").value,
			projetoId: document.querySelector("#select-task-project").value || null,
			favorita: document.querySelector("#input-task-favorite").checked,
			tags: readTagsSelected("task-tags-select"),
		};

		if (id) {
			editTask(id, dados);
		} else {
			createTask(dados);
		}

		closeModal("modal-task");
	});

	formProject.addEventListener("submit", (e) => {
		e.preventDefault();

		const id = document.querySelector("#input-project-id").value;

		const dados = {
			nome: document.querySelector("#input-project-name").value.trim(),
			descricao: document.querySelector("#input-project-description").value.trim(),
			prazo: document.querySelector("#input-project-deadline").value,
			status: document.querySelector("#select-project-status").value,
			tags: readTagsSelected("project-tags-select"),
		};

		if (id) {
			editProject(id, dados);
		} else {
			createProject(dados);
		}

		closeModal("modal-project");
	});

	formTag.addEventListener("submit", (e) => {
		e.preventDefault();

		const id = document.querySelector("#input-tag-id").value;

		const dados = {
			nome: document.querySelector("#input-tag-name").value.trim(),
			cor: document.querySelector("#input-tag-color").value,
		};

		if (id) {
			editTag(id, dados.nome, dados.cor);
		} else {
			createTag(dados.nome, dados.cor);
		}

		closeModal("modal-tag");
	});

	btnConfirmDelete.addEventListener("click", () => {
		if (pendingDeleteType === "task") deleteTask(pendingDeleteId);
		if (pendingDeleteType === "project") deleteProject(pendingDeleteId);
		if (pendingDeleteType === "tag") deleteTag(pendingDeleteId);
		closeModal("modal-confirm");
	});
}

function populateSelectProjects(projetoIdSelected = null) {
	const selectTask = document.querySelector("#select-task-project");

	selectTask.innerHTML = "";
	let options = "<option value='' selected>Nenhum (tarefa independente)</option>";
	const project = getProjects();
	project.forEach((p) => {
		const selected = p.id === projetoIdSelected ? "selected" : "";
		options += `<option value="${p.id}" ${selected}>${p.nome}</option>`;
	});

	selectTask.innerHTML = options;
}

function openModalTask(id = null) {
	const modalTitle = document.querySelector("#modal-task-heading");
	const hiddenField = document.querySelector("#input-task-id");
	populateSelectProjects();

	if (id === null) {
		modalTitle.textContent = "Nova Tarefa";
		hiddenField.value = "";
		document.querySelector("#form-task").reset();
		populateTagsSelect([]);
		openModal("modal-task");
	} else {
		const task = getTasks().find((t) => t.id === id);

		if (task === undefined) return;

		modalTitle.textContent = "Editar Tarefa";
		hiddenField.value = id;
		document.querySelector("#input-task-title").value = task.titulo;
		document.querySelector("#input-task-description").value = task.descricao;
		document.querySelector("#input-task-deadline").value = task.prazo;
		document.querySelector("#select-task-priority").value = task.prioridade;
		document.querySelector("#select-task-project").value = task.projetoId;
		document.querySelector("#input-task-favorite").checked = task.favorita;

		populateTagsSelect(task.tags);
		openModal("modal-task");
	}
}

function openModalProject(id = null) {
	const modalTitle = document.querySelector("#modal-project-heading");
	const hiddenField = document.querySelector("#input-project-id");
	populateSelectProjects();

	if (id === null) {
		modalTitle.textContent = "Novo Projeto";
		hiddenField.value = "";
		document.querySelector("#form-project").reset();
		populateTagsSelect([]);
		openModal("modal-project");
	} else {
		const project = getProjects().find((p) => p.id === id);

		if (project === undefined) return;

		modalTitle.textContent = "Editar Projeto";
		hiddenField.value = id;
		document.querySelector("#input-project-name").value = project.nome;
		document.querySelector("#input-project-description").value = project.descricao;
		document.querySelector("#input-project-deadline").value = project.prazo;
		document.querySelector("#select-project-status").value = project.status;

		populateTagsSelect(project.tags);
		openModal("modal-project");
	}
}

function openModalTag(id = null) {
	const modalTitle = document.querySelector("#modal-tag-heading");
	const hiddenField = document.querySelector("#input-tag-id");
	const hiddenFieldColor = document.querySelector("#input-tag-color");

	if (id === null) {
		modalTitle.textContent = "Nova Tag";
		hiddenField.value = "";
		document.querySelector("#form-tag").reset();
		hiddenFieldColor.value = "#667eea";
		openModal("modal-tag");
	} else {
		const tag = getTags().find((t) => t.id === id);

		if (tag === undefined) return;

		modalTitle.textContent = "Editar Tag";
		hiddenField.value = id;
		document.querySelector("#input-tag-name").value = tag.nome;
		document.querySelector("#input-tag-color").value = tag.cor;
		openModal("modal-tag");
	}
}

function configModais() {
	document.querySelectorAll("#btn-new-task, #btn-new-task-page").forEach((btn) => {
		btn.addEventListener("click", () => openModalTask());
	});

	document.querySelectorAll("#modal-task-close, #modal-task-cancel").forEach((btn) => {
		btn.addEventListener("click", () => closeModal("modal-task"));
	});

	document.querySelectorAll("#btn-new-project, #btn-new-project-page").forEach((btn) => {
		btn.addEventListener("click", () => openModalProject());
	});

	document.querySelectorAll("#modal-project-close, #modal-project-cancel").forEach((btn) => {
		btn.addEventListener("click", () => closeModal("modal-project"));
	});

	document.querySelector("#btn-new-tag").addEventListener("click", () => openModalTag());

	document.querySelectorAll("#modal-tag-close, #modal-tag-cancel").forEach((btn) => {
		btn.addEventListener("click", () => closeModal("modal-tag"));
	});

	document.querySelector("#btn-confirm-cancel").addEventListener("click", () => closeModal("modal-confirm"));

	document.querySelectorAll(".modal").forEach((dialog) => {
		dialog.addEventListener("click", (e) => {
			if (e.target === dialog) closeModal(dialog.id);
		});
	});
}
