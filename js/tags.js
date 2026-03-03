function renderTags() {
	const tags = getTags();
	const tagList = document.querySelector("#tag-list");
	const tagGrid = document.querySelector("#tag-grid");

	tagList.innerHTML = "";
	tagGrid.innerHTML = "";

	if (tags.length === 0) {
		tagList.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i data-lucide="inbox"></i>
                    </div>
                    <h3 class="empty-state__title">Nenhuma tag encontrada</h3>
                    <p class="empty-state__text">Crie sua primeira tag clicando em Nova Tag.</p>
                </div>
            </td>
        </tr>
        `;
	} else {
		const totalTasks = getTasks().length;
		const totalProjects = getProjects().length;

		tags.forEach((item) => {
			const usoCount = getTasks().filter((task) => task.tags.includes(item.id)).length;
			+getProjects().filter((project) => project.tags.includes(item.id)).length;
			const usoPercent =
				totalTasks + totalProjects > 0 ? Math.round((usoCount / (totalTasks + totalProjects)) * 100) : 0;
			const tr = document.createElement("tr");
			tr.classList.add("data-table__row");
			tr.setAttribute("data-tag-id", item.id);
			tr.innerHTML = `
                <td class="data-table__td data-table__td--name">
                    <span class="data-table__name">${item.nome}</span>
                </td>
                <td class="data-table__td data-table__td--color">
                    <div class="color-cell">
                        <span class="color-cell__dot" aria-hidden="true" style="background-color: ${item.cor}"></span>
                        <span class="color-cell__value">${item.cor}</span>
                    </div>
                </td>
                <td class="data-table__td data-table__td--count">
                    <span>${usoCount}</span>
                </td>
                <td class="data-table__td data-table__td--usage">
                    <div class="progress-bar" role="progressbar" aria-label="${usoPercent}% de uso total">
                        <div class="progress-bar__fill" style="width: ${usoPercent}%"></div>
                    </div>
                </td>
                <td class="data-table__td data-table__td--actions">
                    <div class="data-table__actions">
                        <button class="btn btn--icon" data-action="edit" aria-label="Editar tag: ${item.nome}">
                            <i data-lucide="pencil" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn--icon btn--icon-danger" data-action="delete" aria-label="Excluir tag: ${item.nome}">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            `;
			tagList.appendChild(tr);

			const article = document.createElement("article");
			article.classList.add("tag-card");
			article.setAttribute("data-tag-id", item.id);
			article.innerHTML = `
                <div class="tag-card__header">
                    <h2 class="tag-card__name">${item.nome}</h2>
                    <span class="tag-card__icon" aria-hidden="true" style="color: ${item.cor}">
                        <i data-lucide="heart-pulse"></i>
                    </span>
                </div>
                <div class="tag-card__body">
                    <span class="tag-card__count">${usoCount} ${usoCount === 1 ? "tarefa" : "tarefas"}</span>
                </div>
            `;
			tagGrid.appendChild(article);
		});
	}
}

function createTag(nome, cor) {
	if (nome === "" || nome.length < 1) {
		return;
	}

	const tags = getTags();

	const hasName = tags.some((tag) => tag.nome.toLowerCase() === nome.toLowerCase());
	if (hasName) {
		showToast("Já existe uma tag com esse nome", "error");
		return;
	}

	const tag = {
		id: generateID(),
		nome: nome.trim(),
		cor: cor,
		criadaEm: Date.now(),
	};

	tags.push(tag);
	saveTags(tags);
	renderTags();

	showToast("Tag criada com sucesso!", "success");
}

function editTag(id, novoNome, novaCor) {
	const tags = getTags();
	let indice = tags.findIndex((tag) => tag.id === id);

	if (indice === -1) {
		return;
	}

	const hasName = tags.some((tag) => tag.nome.toLowerCase() === novoNome.toLowerCase() && tag.id !== id);
	if (hasName) {
		showToast("Já existe uma tag com esse nome", "error");
		return;
	}

	tags[indice].nome = novoNome;
	tags[indice].cor = novaCor;

	saveTags(tags);
	renderTags();
	showToast("Tag atualizada", "success");
}

function deleteTag(id) {
	const tags = getTags();
	const newTags = tags.filter((tag) => tag.id !== id);
	saveTags(newTags);
	renderTags();
	showToast("Tag removida", "success");
}

function renderColorPicker(corSelecionada) {
	const colors = [
		"#667eea",
		"#f093fb",
		"#4facfe",
		"#43e97b",
		"#fa709a",
		"#fd7979",
		"#ffecd2",
		"#a18cd1",
		"#fccb90",
		"#84fab0",
		"#30cfd0",
		"#0ba360",
	];

	const container = document.querySelector("#color-picker");
	const input = document.querySelector("#input-tag-color");
	container.innerHTML = "";

	colors.forEach((color) => {
		const button = document.createElement("button");
		button.type = "button";
		button.classList.add("color-option");
		button.style.backgroundColor = color;
		button.setAttribute("aria-label", `Selecionar cor ${color}`);
		button.setAttribute("data-color", color);

		if (color === corSelecionada) {
			button.classList.add("selected");
		}

		button.addEventListener("click", (e) => {
			document.querySelectorAll(".color-option").forEach((btn) => btn.classList.remove("selected"));
			button.classList.add("selected");
			input.value = color;
		});

		container.appendChild(button);
	});
}

function populateTagsSelect(selectedIds, containerId = "task-tags-select") {
	const container = document.querySelector(`#${containerId}`);

	const tags = getTags();

	container.innerHTML = "";

	if (tags.length === 0) {
		container.innerHTML = "<span>Nenhuma tag cadastrada</span>";
		return;
	}

	tags.forEach((tag) => {
		const span = document.createElement("span");
		span.className = "tags-select__item";
		span.dataset.tagId = tag.id;
		span.textContent = tag.nome;

		if (selectedIds.includes(tag.id)) {
			span.classList.add("selected");
		}

		span.addEventListener("click", () => {
			span.classList.toggle("selected");
		});

		container.appendChild(span);
	});
}
