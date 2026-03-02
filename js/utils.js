function generateID() {
	return Date.now().toString();
}

function formatDate(dateString) {
	if (!dateString) return "-";

	let [ano, mes, dia] = dateString.split("-");
	return `${dia}/${mes}/${ano}`;
}

function isOverdue(dateString) {
	if (!dateString) return false;

	let today = new Date().toISOString().split("T")[0];

	return dateString < today;
}

function daysOverdue(dateString) {
	if (!dateString) return 0;
	let today = new Date();
	let dueDate = new Date(dateString);
	let diffTime = today - dueDate;
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function showToast(message, type) {
	const stack = document.querySelector("#toast-stack");

	const icons = {
		success: "check-circle",
		error: "x-circle",
		warning: "alert-triangle",
		info: "info",
	};

	const toast = document.createElement("div");
	toast.classList.add("toast", `toast--${type}`);
	toast.innerHTML = `
        <i data-lucide="${icons[type]}" aria-hidden="true"></i>
        <span class="toast__message">${message}</span>
        <button class="toast__close" aria-label="Fechar notificação">
            <i data-lucide="x" aria-hidden="true"></i>
        </button>
    `;

	stack.appendChild(toast);

	lucide.createIcons();

	const close = toast.querySelector(".toast__close");
	close.addEventListener("click", () => {
		toast.classList.add("hide");
		toast.remove();
	});

	setTimeout(() => {
		if (toast.parentNode !== null) {
			toast.classList.add("hide");
		}
		setTimeout(() => {
			toast.remove();
		}, 400);
	}, 4000);
}

function openModal(modalId) {
	let modal = document.getElementById(modalId);

	if (modal) modal.showModal();
}

function closeModal(modalId) {
	let modal = document.getElementById(modalId);

	if (modal) modal.close();
}
