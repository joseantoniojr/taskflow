function renderTasks(filtro = "all", ordenarPor = "newest") {
	const tasks = getTasks();
	const projects = getProjects();
	const tags = getTags();

	const dashboardList = document.querySelector("#dashboard-task-list");
	const taskList = document.querySelector("#task-list");

	dashboardList.innerHTML = "";
	taskList.innerHTML = "";

	const filtros = {
		all: () => true,
		active: (task) => !task.concluida,
		completed: (task) => task.concluida,
		overdue: (task) => isOverdue(task.prazo) && !task.concluida,
	};

	const prioridadesPeso = {
		high: 3,
		medium: 2,
		low: 1,
	};

	const ordenacoes = {
		newest: (a, b) => b.criadaEm - a.criadaEm,
		oldest: (a, b) => a.criadaEm - b.criadaEm,
		priority: (a, b) => prioridadesPeso[b.prioridade] - prioridadesPeso[a.prioridade],
		deadline: (a, b) => new Date(a.prazo) - new Date(b.prazo),
		alpha: (a, b) => a.titulo.localeCompare(b.titulo),
	};

	const tasksFiltradas = tasks.filter(filtros[filtro] || filtros.all);
	tasksFiltradas.sort(ordenacoes[ordenarPor] || ordenacoes.newest);

	if (tasksFiltradas.length === 0) {
		dashboardList.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state__icon">
                            <i data-lucide="inbox"></i>
                        </div>
                        <h3 class="empty-state__title">Nenhuma tarefa encontrada</h3>
                        <p class="empty-state__text">Crie sua primeira tarefa clicando em Nova Tarefa.</p>
                    </div>
                </td>
            </tr>
        `;

		taskList.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state__icon">
                            <i data-lucide="inbox"></i>
                        </div>
                        <h3 class="empty-state__title">Nenhuma tarefa encontrada</h3>
                        <p class="empty-state__text">Crie sua primeira tarefa clicando em Nova Tarefa.</p>
                    </div>
                </td>
            </tr>
        `;

		return;
	} else {
		const prioridades = {
			high: ["badge--high", "Alta"],
			medium: ["badge--medium", "Média"],
			low: ["badge--low", "Baixa"],
		};

		tasksFiltradas.forEach((task, index) => {
			const project = projects.find((project) => project.id === task.projetoId);
			const prioridade = prioridades[task.prioridade] || ["", ""];
			const tagsHtml = task.tags
				.map((id) => {
					const tag = tags.find((t) => t.id === id);
					if (tag) return `<li><span class="tag-badge">${tag.nome}</span></li>`;
					return "";
				})
				.join("");

			let rowClass = "";
			if (task.concluida === true) {
				rowClass = "data-table__row--completed";
			}

			if (isOverdue(task.prazo) && !task.concluida) {
				rowClass = "data-table__row--overdue";
			}

			const trow = document.createElement("tr");
			trow.className = "data-table__row " + rowClass;
			trow.dataset.taskId = task.id;
			trow.innerHTML = `
                <td class="data-table__td data-table__td--check">
                    <label for="check-task-${task.id}" class="sr-only">${task.titulo}</label>
                    <input type="checkbox" id="check-task-${task.id}" name="task" ${task.concluida ? "checked" : ""}>
                </td>
                <td class="data-table__td data-table__td--name">
                    <div class="data-table__name-cell">
                        <span class="data-table__name">${task.titulo}</span>
                        <button class="btn-favorite ${task.favorita ? "btn-favorite--active" : ""}" data-action="favorite" aria-label="Remover dos favoritos">
                            <i data-lucide="star" aria-hidden="true"></i>
                        </button>
                    </div>
                    <p class="data-table__description">${task.descricao}</p>
                </td>
                <td class="data-table__td data-table__td--deadline">
                    <div class="data-table__deadline-cell">
                        <i data-lucide="calendar" aria-hidden="true"></i>
                        <time datetime="${task.prazo}">${formatDate(task.prazo)}</time>
                    </div>
                </td>
                <td class="data-table__td data-table__td--tag">
                    <ul class="tag-list" aria-label="Tags da tarefa">
                        ${tagsHtml ? tagsHtml : "-"}
                    </ul>
                </td>
                <td class="data-table__td data-table__td--priority">
                    <span class="badge ${prioridade[0]}">${prioridade[1]}</span>
                </td>
                <td class="data-table__td data-table__td--actions">
                    <div class="data-table__actions">
                        <button class="btn btn--icon" data-action="edit" aria-label="Editar: ${task.titulo}">
                            <i data-lucide="pencil" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn--icon btn--icon-danger" data-action="delete" aria-label="Excluir: ${task.titulo}">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            `;
			taskList.appendChild(trow);
			if (index < 5) dashboardList.appendChild(trow.cloneNode(true));
		});

		lucide.createIcons();
	}
}

function createTask(dados) {
	if (dados.titulo.length < 3 || dados.titulo == "") {
		showToast("Digite o nome com mais de 3 caracteres", "error");
		return;
	}

	const tasks = getTasks();

	const task = {
		id: generateID(),
		titulo: dados.titulo.trim(),
		descricao: dados.descricao,
		concluida: false,
		prioridade: dados.prioridade,
		tags: dados.tags,
		favorita: dados.favorita,
		prazo: dados.prazo,
		projetoId: dados.projetoId || null,
		criadaEm: Date.now(),
		atualizadaEm: Date.now(),
	};

	tasks.push(task);
	saveTasks(tasks);
	renderTasks();
	renderTags();
	showToast("Tarefa criada com sucesso!", "success");
	renderStats();
}

function editTask(id, dados) {
	const tasks = getTasks();
	let indice = tasks.findIndex((task) => task.id === id);

	if (indice === -1) return;

	const hasName = tasks.some((task) => task.titulo.toLowerCase() === dados.titulo.toLowerCase() && task.id !== id);

	if (hasName) {
		showToast("Já existe uma tarefa com esse nome", "error");
		return;
	}

	tasks[indice].titulo = dados.titulo;
	tasks[indice].descricao = dados.descricao;
	tasks[indice].concluida = dados.concluida;
	tasks[indice].prioridade = dados.prioridade;
	tasks[indice].tags = dados.tags;
	tasks[indice].favorita = dados.favorita;
	tasks[indice].prazo = dados.prazo;
	tasks[indice].projetoId = dados.projetoId;
	tasks[indice].atualizadaEm = Date.now();

	saveTasks(tasks);
	renderTasks();
	renderTags();
	showToast("Tarefa Atualizada!", "success");
	renderStats();
}

function deleteTask(id) {
	const tasks = getTasks();
	const newTasks = tasks.filter((task) => task.id !== id);

	saveTasks(newTasks);
	renderTasks();
	renderTags();
	showToast("Tarefas removida!", "success");
	renderStats();
}

function tasksStats() {
	const tasks = getTasks();
	const total = tasks.length;
	const active = tasks.filter((task) => !task.concluida).length;
	const completed = tasks.filter((task) => task.concluida).length;
	const today = tasks.filter((task) => new Date(task.criadaEm).toDateString() === new Date().toDateString()).length;
	const overdue = tasks.filter((task) => isOverdue(task.prazo) && !task.concluida);
	const listOverdue = overdue.sort((a, b) => daysOverdue(b.prazo) - daysOverdue(a.prazo));
	const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

	return { total, active, today, listOverdue, percent };
}

function toggleComplete(id) {
	const tasks = getTasks();
	let indice = tasks.findIndex((task) => task.id === id);

	if (tasks[indice].concluida) {
		tasks[indice].concluida = false;
		showToast("Tarefa reaberta!", "info");
	} else {
		tasks[indice].concluida = true;
		showToast("Tarefa concluída!", "success");
	}

	tasks[indice].atualizadaEm = Date.now();

	saveTasks(tasks);
	renderTasks(taskFiltro, taskOrdenacao);
	renderProjects(projectFiltro, projectOrdenacao);
	renderStats();
}

function toggleFavorite(id) {
	const tasks = getTasks();
	let indice = tasks.findIndex((task) => task.id === id);

	if (tasks[indice].favorita) {
		tasks[indice].favorita = false;
	} else {
		tasks[indice].favorita = true;
	}

	tasks[indice].atualizadaEm = Date.now();

	saveTasks(tasks);
	renderTasks();
}
