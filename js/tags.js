function renderTags() {
	const tags = getTags();
	const tagList = document.querySelector("#tag-list");
	const tagGrid = document.querySelector("#tag-grid");

	tagList.innerHTML = "";
	tagGrid.innerHTML = "";

	let gridHtml = "";

	if (tags.length === 0) {
		tagList.innerHTML = `
        <tr>
            <td colspan="5">
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
	} else {
		tags.forEach((item) => {
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
                    <span>0</span>
                </td>
                <td class="data-table__td data-table__td--usage">
                    <div class="progress-bar" role="progressbar" aria-label="62% de uso total">
                        <div class="progress-bar__fill"></div>
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
                    <span class="tag-card__icon" aria-hidden="true">
                        <i data-lucide="heart-pulse"></i>
                    </span>
                </div>
                <div class="tag-card__body">
                    <span class="tag-card__count">12 tarefas</span>
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

function populateTagsSelect(selectedIds) {
	const modalTask = document.querySelector("#task-tags-select");
	const modalProject = document.querySelector("#project-tags-select");

	const tags = getTags();

	modalTask.innerHTML = "";
	modalProject.innerHTML = "";

	if (tags.length === 0) {
		modalTask.innerHTML = "<span>Nenhuma tag cadastrada</span>";
		modalProject.innerHTML = "<span>Nenhuma tag cadastrada</span>";
		return;
	}

	tags.forEach((tag) => {
		const spanTask = document.createElement("span");
		const spanProject = document.createElement("span");

		spanTask.className = "tags-select__item";
		spanProject.className = "tags-select__item";

		spanTask.dataset.tagId = tag.id;
		spanProject.dataset.tagId = tag.id;

		spanTask.textContent = tag.nome;
		spanProject.textContent = tag.nome;

		if (selectedIds.includes(tag.id)) {
			spanTask.classList.add("selected");
			spanProject.classList.add("selected");
		}

		spanTask.addEventListener("click", () => {
			spanTask.classList.toggle("selected");
		});

		spanProject.addEventListener("click", () => {
			spanProject.classList.toggle("selected");
		});

		modalTask.appendChild(spanTask);
		modalProject.appendChild(spanProject);
	});
}
