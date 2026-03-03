function renderProjects(filtro = "all", ordenarPor = "newest") {
	const projects = getProjects();
	const projectGrid = document.querySelector("#project-grid");
	const projectList = document.querySelector("#project-list");

	projectGrid.innerHTML = "";
	projectList.innerHTML = "";

	const filtros = {
		all: () => true,
		active: (project) => project.status === "ativo",
		completed: (project) => project.status === "concluido",
		overdue: (project) => isOverdue(project.prazo) && project.status !== "concluido",
	};

	const ordenacoes = {
		newest: (a, b) => b.criadaEm - a.criadaEm,
		oldest: (a, b) => a.criadaEm - b.criadaEm,
		progress: (a, b) => calculeProgress(b.id) - calculeProgress(a.id),
		deadline: (a, b) => new Date(a.prazo) - new Date(b.prazo),
		alpha: (a, b) => a.nome.localeCompare(b.nome),
	};

	const projectsFiltradas = projects.filter(filtros[filtro] || filtros.all);
	projectsFiltradas.sort(ordenacoes[ordenarPor] || ordenacoes.newest);

	if (projectsFiltradas.length === 0) {
		projectList.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i data-lucide="inbox"></i>
                    </div>
                    <h3 class="empty-state__title">Nenhum projeto encontrado</h3>
                    <p class="empty-state__text">Crie seu primeiro projeto clicando em Nova Projeto.</p>
                </div>
            </td>
        </tr>
        `;
		return;
	}

	const status = {
		ativo: ["badge--in-progress", "Em Andamento"],
		concluido: ["badge--completed", "Concluído"],
		planejando: ["badge--planning", "Planejamento"],
		pausado: ["badge--paused", "Pausado"],
		cancelado: ["badge--cancelled", "Cancelado"],
	};

	projectsFiltradas.forEach((project) => {
		const article = document.createElement("article");
		article.className = "project-card";
		article.dataset.projectId = project.id;
		article.innerHTML = `
            <div class="project-card__header">
                <span class="badge ${status[project.status][0]}">${status[project.status][1]}</span>
                <div class="dropdown">
                    <button class="btn btn--icon" popovertarget="project-${project.id}" popovertargetaction="toggle" aria-label="Opções do projeto ${project.nome}">
                        <i data-lucide="ellipsis" aria-hidden="true"></i>
                    </button>
                    <div class="dropdown__menu" id="project-${project.id}" role="menu" popover="auto">
                        <button class="dropdown__item" data-action="edit">
                            <i data-lucide="pencil" aria-hidden="true"></i> Editar
                        </button>
                        <button class="dropdown__item dropdown__item--danger" data-action="delete">
                            <i data-lucide="trash-2" aria-hidden="true"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
            <div class="project-card__body">
                <h2 class="project-card__title">${project.nome}</h2>
                <div class="project-card__progress">
                    <div class="project-card__progress-info">
                        <span class="project-card__progress-label">Progresso</span>
                        <span class="project-card__progress-value">${calculeProgress(project.id)}%</span>
                    </div>
                    <div class="progress-bar" role="progressbar" aria-label="${calculeProgress(project.id)}% concluído">
                        <div class="progress-bar__fill" style="width: ${calculeProgress(project.id)}%;"></div>
                    </div>
                </div>
            </div>
            <div class="project-card__footer">
                <i data-lucide="calendar" aria-hidden="true"></i>
                <time datetime="${project.prazo}">${formatDate(project.prazo)}</time>
            </div>
        `;

		const tr = document.createElement("tr");
		tr.className = "data-table__row";
		tr.dataset.projectId = project.id;

		tr.innerHTML = `
            <td class="data-table__td data-table__td--check">
                <label for="check-project-${project.id}" class="sr-only">${project.nome}</label>
                <input type="checkbox" id="check-project-${project.id}" name="project">
            </td>
            <td class="data-table__td data-table__td--name">
                <div class="data-table__name-cell">
                    <span class="data-table__name">${project.nome}</span>
                    <button class="btn-favorite btn-favorite--active" data-action="favorite" aria-label="Remover dos favoritos">
                        <i data-lucide="star" aria-hidden="true"></i>
                    </button>
                </div>
                <p class="data-table__description">${project.descricao}</p>
            </td>
            <td class="data-table__td data-table__td--deadline">
                <div class="data-table__deadline-cell">
                    <i data-lucide="calendar" aria-hidden="true"></i>
                    <time datetime="${formatDate(project.prazo)}">${formatDate(project.prazo)}</time>
                </div>
            </td>
            <td class="data-table__td data-table__td--status">
                <span class="badge ${status[project.status][0]}">${status[project.status][1]}</span>
            </td>
            <td class="data-table__td data-table__td--actions">
                <div class="data-table__actions">
                    <button class="btn btn--icon" data-action="edit" aria-label="Editar: ${project.nome}">
                        <i data-lucide="pencil" aria-hidden="true"></i>
                    </button>
                    <button class="btn btn--icon btn--icon-danger" data-action="delete" aria-label="Excluir: ${project.nome}">
                        <i data-lucide="trash-2" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        `;

		projectGrid.appendChild(article);
		projectList.appendChild(tr);
	});

	lucide.createIcons();
}

function createProject(dados) {
	if (dados.nome.length < 2 || dados.nome === "") {
		showToast("Digite o nome com mais de 3 caracteres.", "error");
		return;
	}

	const projects = getProjects();

	const project = {
		id: generateID(),
		nome: dados.nome.trim(),
		descricao: dados.descricao,
		status: dados.status,
		tags: dados.tags,
		prazo: dados.prazo,
		criadaEm: Date.now(),
		atualizadaEm: Date.now(),
	};

	projects.push(project);
	saveProjects(projects);
	renderProjects();
	showToast("Projeto criado com sucesso", "success");
	renderStats();
}

function editProject(id, dados) {
	const projects = getProjects();
	let indice = projects.findIndex((project) => project.id === id);

	if (indice === -1) return;

	const hasName = projects.some(
		(project) => project.nome.toLowerCase() === dados.nome.toLowerCase() && project.id !== id,
	);
	if (hasName) {
		showToast("Já existe um projeto com esse nome", "error");
		return;
	}

	projects[indice].nome = dados.nome;
	projects[indice].descricao = dados.descricao;
	projects[indice].status = dados.status;
	projects[indice].tags = dados.tags;
	projects[indice].prazo = dados.prazo;
	projects[indice].atualizadoEm = Date.now();

	saveProjects(projects);
	renderProjects();
	showToast("Projeto atualizado!", "success");
	renderStats();
}

function deleteProject(id) {
	const projects = getProjects();
	const newProjects = projects.filter((project) => project.id !== id);
	saveProjects(newProjects);

	const tasks = getTasks();
	const newTasks = tasks.map((task) => {
		if (task.projetoId === id) {
			return { ...task, projetoId: null };
		}

		return task;
	});

	saveTasks(newTasks);
	renderProjects();
	showToast("Projeto e tarefas desvinculadas", "success");
	renderStats();
}

function completedTasksCount(projectId) {
	const tasks = getTasks();
	return tasks.filter((task) => task.projetoId === projectId && task.concluida).length;
}

function projectsStats() {
	const projects = getProjects();

	let listProjects = [...projects].sort((a, b) => completedTasksCount(b.id) - completedTasksCount(a.id));

	return { listProjects };
}

function calculeProgress(projectId) {
	const tasks = getTasks();

	let totalTasks = tasks.filter((task) => task.projetoId === projectId).length;

	if (totalTasks === 0) {
		return 0;
	}

	let completedTasks = tasks.filter((task) => task.concluida === true && task.projetoId === projectId).length;

	return Math.round((completedTasks / totalTasks) * 100);
}
