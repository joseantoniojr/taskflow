let pendingDeleteId;
let pendingDeleteType;
let taskFiltro = "all";
let taskOrdenacao = "newest";
let projectFiltro = "all";
let projectOrdenacao = "newest";

document.addEventListener("DOMContentLoaded", () => {
	const media = window.matchMedia("(width < 768px)");
	init();
});

function init() {
	carregarTema();

	renderTasks(taskFiltro, taskOrdenacao);
	renderProjects(projectFiltro, projectOrdenacao);
	renderTags();
	renderStats();

	configNavigation();
	configHamburger();

	configSearch();
	configModais();
	configForm();
	configAction();
	configFilters();
	configOrdination();

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
	const searchResults = document.querySelector("#search-results");
	termo = termo.trim().toLowerCase();

	if (termo === "") {
		searchResults.hidden = true;
		renderTasks(taskFiltro, taskOrdenacao);
		renderProjects(projectFiltro, projectOrdenacao);
		return;
	}

	searchResults.hidden = false;

	const tasks = getTasks().filter((task) => task.titulo.toLowerCase().includes(termo));
	const projects = getProjects().filter((project) => project.nome.toLowerCase().includes(termo));

	renderSearchResults(tasks, projects);
}

function renderSearchResults(tasks, projects) {
	const searchTaskList = document.querySelector("#search-task-list");
	const searchProjectList = document.querySelector("#search-project-list");

	searchTaskList.innerHTML = "";
	searchProjectList.innerHTML = "";

	if (tasks.length === 0) {
		searchTaskList.innerHTML = `
			<li class="search-results__list-item">
				<h4 class="search-results__list-title">Nenhuma tarefa encontrada</h4>
			</li>
		`;
	} else {
		const prioridades = {
			high: ["badge--high", "Alta"],
			medium: ["badge--medium", "Média"],
			low: ["badge--low", "Baixa"],
		};

		tasks.forEach((task) => {
			const li = document.createElement("li");
			const prioridade = prioridades[task.prioridade] || ["", ""];
			li.className = "search-results__list-item";
			li.innerHTML = `
				<span class="search-results__list-title">${task.titulo}</span>
				<span class="badge ${prioridade[0]}">${prioridade[1]}</span>
			`;
			searchTaskList.appendChild(li);
		});
	}

	if (projects.length === 0) {
		searchProjectList.innerHTML = `
			<li class="search-results__list-item">
				<h4 class="search-results__list-title">Nenhum projeto encontrado</h4>
			</li>
		`;
	} else {
		const status = {
			ativo: ["badge--in-progress", "Em Andamento"],
			concluido: ["badge--completed", "Concluído"],
			planejando: ["badge--planning", "Planejamento"],
			pausado: ["badge--paused", "Pausado"],
			cancelado: ["badge--cancelled", "Cancelado"],
		};

		projects.forEach((project) => {
			const li = document.createElement("li");
			li.className = "search-results__list-item";
			li.innerHTML = `
				<span class="search-results__list-title">${project.nome}</span>
				<span class="badge ${status[project.status][0]}">${status[project.status][1]}</span>
			
		`;
			searchProjectList.appendChild(li);
		});
	}
}

function renderStats() {
	const statsTasks = tasksStats();
	const statsProjects = projectsStats();
	const total = document.querySelector("#stats-total");
	const active = document.querySelector("#stats-active");
	const today = document.querySelector("#stats-today");
	const completed = document.querySelector("#stats-completed");
	const overdue = document.querySelector("#stats-overdue");
	const projects = document.querySelector("#stats-projects");
	const progressBarFill = document.querySelector("#progress-bar-fill");

	const listaOverdue = statsTasks.listOverdue.slice(0, 2);
	const listaProjects = statsProjects.listProjects.slice(0, 2);

	overdue.innerHTML = "";
	projects.innerHTML = "";

	if (listaOverdue.length > 0) {
		listaOverdue.forEach((task) => {
			const div = document.createElement("div");
			div.className = "stat-card__row";
			div.innerHTML = `
				<div class="stat-card__row-header">	
					<span class="stat-card__row-title">${task.titulo}</span>
					<span class="stat-card__row-info badge badge--high">${daysOverdue(task.prazo)} ${daysOverdue(task.prazo) === 1 ? "dia" : "dias"} de atraso</span>
				</div>
			`;

			overdue.appendChild(div);
		});
	} else {
		overdue.innerHTML = `
			<div class="stat-card__row">
				<span class="stat-card__row-title">Nenhuma tarefa atrasada</span>
				<span class="stat-card__row-info">
					<i data-lucide="check-circle"></i>
				</span>	
			</div>
		`;
	}

	if (listaProjects.length > 0) {
		listaProjects.forEach((project) => {
			const div = document.createElement("div");
			div.className = "stat-card__row";
			const progress = calculeProgress(project.id);
			div.innerHTML = `
				<div class="stat-card__row-header">	
					<span class="stat-card__row-title">${project.nome}</span>
					<span class="stat-card__row-info">${progress}%</span>
				</div>
				<div class="progress-bar" role="progressbar" aria-label="${project.nome}: ${progress}% concluído">
					<div class="progress-bar__fill" style="width: ${progress}%;"></div>
				</div>
			`;

			projects.appendChild(div);
		});
	} else {
		projects.innerHTML = `
			<div class="stat-card__row">
				<span class="stat-card__row-title">Nenhum projeto cadastrado</span>	
				<span class="stat-card__row-info">
					<i data-lucide="check-circle"></i>
				</span>
			</div>
		`;
	}

	if (statsTasks.total === 0) {
		total.textContent = 0;
		active.textContent = 0;
		today.textContent = 0;
		completed.textContent = "0%";
		progressBarFill.style.width = "0%";
		return;
	}

	total.textContent = statsTasks.total;
	active.textContent = statsTasks.active;
	today.textContent = statsTasks.today;
	completed.textContent = statsTasks.percent + "%";
	progressBarFill.style.width = statsTasks.percent + "%";
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
	const checkAllDash = document.querySelector("#check-dashboard-all");
	const checkAllTask = document.querySelector("#check-tasks-all");

	checkAllDash.addEventListener("change", (e) => {
		const checked = e.target.checked;
		const taskCheckboxes = dashboardList.querySelectorAll("input[type='checkbox'][name='task']");

		taskCheckboxes.forEach((checkbox) => {
			if (checked) {
				if (checked && !checkbox.checked) {
					checkbox.checked = true;
					toggleComplete(checkbox.closest("tr").dataset.taskId);
				}
			} else if (!checked && checkbox.checked) {
				checkbox.checked = false;
				toggleComplete(checkbox.closest("tr").dataset.taskId);
			}
		});
	});

	checkAllTask.addEventListener("change", (e) => {
		const checked = e.target.checked;
		const taskCheckboxes = taskList.querySelectorAll("input[type='checkbox'][name='task']");

		taskCheckboxes.forEach((checkbox) => {
			if (checked) {
				if (checked && !checkbox.checked) {
					checkbox.checked = true;
					toggleComplete(checkbox.closest("tr").dataset.taskId);
				}
			} else if (!checked && checkbox.checked) {
				checkbox.checked = false;
				toggleComplete(checkbox.closest("tr").dataset.taskId);
			}
		});
	});

	[taskList, dashboardList].forEach((container) => {
		container.addEventListener("change", (e) => {
			if (e.target.type === "checkbox" && e.target.name === "task") {
				const tr = e.target.closest("tr");
				toggleComplete(tr.dataset.taskId);
				return;
			}
		});

		container.addEventListener("click", (e) => {
			if (e.target.type === "checkbox") return;
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

function configFilters() {
	const dashboardFilters = document.querySelector("#dashboard-filters");
	const taskFilters = document.querySelector("#task-filters");
	const projectFilters = document.querySelector("#project-filters");

	dashboardFilters.addEventListener("click", (e) => {
		const btn = e.target.closest(".btn--filter");
		if (!btn) return;
		dashboardFilters.querySelectorAll(".btn--filter").forEach((b) => b.classList.remove("btn--filter-active"));
		btn.classList.add("btn--filter-active");
		taskFiltro = btn.dataset.filter;
		renderTasks(taskFiltro, taskOrdenacao);
	});

	taskFilters.addEventListener("click", (e) => {
		const btn = e.target.closest(".btn--filter");
		if (!btn) return;
		taskFilters.querySelectorAll(".btn--filter").forEach((b) => b.classList.remove("btn--filter-active"));
		btn.classList.add("btn--filter-active");
		taskFiltro = btn.dataset.filter;
		renderTasks(taskFiltro, taskOrdenacao);
	});

	projectFilters.addEventListener("click", (e) => {
		const btn = e.target.closest(".btn--filter");
		if (!btn) return;
		projectFilters.querySelectorAll(".btn--filter").forEach((b) => b.classList.remove("btn--filter-active"));
		btn.classList.add("btn--filter-active");
		projectFiltro = btn.dataset.filter;
		renderProjects(projectFiltro, projectOrdenacao);
	});
}

function configOrdination() {
	const dashboardSort = document.querySelector("#select-dashboard-sort");
	const taskSort = document.querySelector("#select-task-sort");
	const projectSort = document.querySelector("#select-project-sort");

	dashboardSort.addEventListener("change", (e) => {
		taskOrdenacao = e.target.value;
		renderTasks(taskFiltro, taskOrdenacao);
	});

	taskSort.addEventListener("change", (e) => {
		taskOrdenacao = e.target.value;
		renderTasks(taskFiltro, taskOrdenacao);
	});

	projectSort.addEventListener("change", (e) => {
		projectOrdenacao = e.target.value;
		renderProjects(projectFiltro, projectOrdenacao);
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
		const taskAtual = id ? getTasks().find((t) => t.id === id) : null;

		const dados = {
			titulo: document.querySelector("#input-task-title").value.trim(),
			descricao: document.querySelector("#input-task-description").value.trim(),
			prazo: document.querySelector("#input-task-deadline").value,
			prioridade: document.querySelector("#select-task-priority").value,
			projetoId: document.querySelector("#select-task-project").value || null,
			favorita: document.querySelector("#input-task-favorite").checked,
			tags: readTagsSelected("task-tags-select"),
			concluida: taskAtual ? taskAtual.concluida : false,
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
		populateTagsSelect([], "task-tags-select");
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

		populateTagsSelect(task.tags ?? [], "task-tags-select");
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
		populateTagsSelect([], "project-tags-select");
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

		populateTagsSelect(project.tags ?? [], "project-tags-select");
		openModal("modal-project");
	}
}

function openModalTag(id = null) {
	const modalTitle = document.querySelector("#modal-tag-heading");

	if (id === null) {
		modalTitle.textContent = "Nova Tag";
		document.querySelector("#form-tag").reset();
		renderColorPicker("#667eea");
		openModal("modal-tag");
	} else {
		const tag = getTags().find((t) => t.id === id);

		if (tag === undefined) return;

		modalTitle.textContent = "Editar Tag";
		document.querySelector("#input-tag-name").value = tag.nome;
		renderColorPicker(tag.cor);
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
