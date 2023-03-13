function todoApp() {
  this.container = "";
  this.mode = "list";
  this.currentTodo = {};

  this.init = function () {
    this.container = document.querySelector("#app");
    this.printButtons();
    this.getAllTodos();
  };

  this.resetCurrentTodo = function () {
    this.currentTodo = {
      id: 0,
      name: "",
      description: "",
      completed: 0,
    };
  };

  this.changeMode = function (mode) {
    this.mode = mode;
    this.container.innerHTML = "";
    this.printButtons();

    if (this.mode === "list") {
      this.getAllTodos();
    }

    if (this.mode === "form") {
      this.printForm();
    }
  };

  this.printButtons = function () {
    if (this.mode === "list") {
      let html = `
        <div class="row">
          <div class="col">
            <div class="p-1 pt-3 mb-3">
              <button id="new-todo" class="btn btn-sm btn-info">Todo anlegen</button>
            </div>
          </div>
        </div>
      `;

      this.container.insertAdjacentHTML("beforeend", html);

      let element = this.container.querySelector("#new-todo");
      element.addEventListener("click", (event) => {
        event.preventDefault();
        this.resetCurrentTodo();
        this.changeMode("form");
      });
    }

    if (this.mode === "form") {
      let html = `
        <div class="row">
          <div class="col">
            <div class="p-1 pt-3 mb-3">
              <button id="back-list" class="btn btn-sm btn-secondary">Zurück</button>
            </div>
          </div>
        </div>
      `;

      this.container.insertAdjacentHTML("beforeend", html);

      let element = this.container.querySelector("#back-list");
      element.addEventListener("click", (event) => {
        event.preventDefault();
        this.changeMode("list");
      });
    }
  };

  this.printTodo = function (todo) {
    let html = `
      <div class="row" id="todo-element-${todo.id}">
        <div class="col">
          <div class="d-flex justify-content-between border border-info border-top-0 border-end-0 border-bottom-1 border-start-0 p-1">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="todo-${
                todo.id
              }" ${todo.completed == 1 ? "checked" : ""}>
              <label id="todo-label-${todo.id}" class="form-check-label ${
      todo.completed == 1 ? "text-decoration-line-through" : ""
    }" for="todo-${todo.id}">
                ${todo.name}
              </label>
            </div>
            <div class="d-flex gap-2">
              <i id="edit-todo-${
                todo.id
              }" class="bi bi-pencil-square" title="bearbeiten"></i>
              <i id="delete-todo-${
                todo.id
              }" class="bi bi-x-square-fill" title="löschen"></i>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.insertAdjacentHTML("beforeend", html);

    // Update
    let element = this.container.querySelector(`#todo-${todo.id}`);
    element.addEventListener("change", (event) => {
      event.preventDefault();

      let data = {
        id: todo.id,
        completed: event.target.checked ? 1 : 0,
      };

      this.updateTodo(data).then(() => {
        let label = this.container.querySelector(`#todo-label-${todo.id}`);
        label.classList.toggle("text-decoration-line-through");
      });
    });

    // Edit
    let editIcon = this.container.querySelector(`#edit-todo-${todo.id}`);
    editIcon.addEventListener("click", () => {
      this.currentTodo = todo;
      this.changeMode("form");
    });

    // Delete
    let deleteIcon = this.container.querySelector(`#delete-todo-${todo.id}`);
    deleteIcon.addEventListener("click", () => {
      this.deleteTodo(todo).then(() => {
        let todoElement = this.container.querySelector(
          `#todo-element-${todo.id}`
        );
        todoElement.remove();
      });
    });
  };

  this.printForm = function () {
    let html = `
      <div class="row">
        <div class="col">
          <form class="p-1">
            <div class="mb-3">
              <label for="todo-title" class="form-label">Title</label>
              <input type="text" class="form-control" id="todo-title" value="${
                this.currentTodo.name
              }">
            </div>
            <div class="mb-3">
              <label for="todo-description" class="form-label">Beschreibung</label>
              <textarea id="todo-description" class="form-control" style="height: 100px">${
                this.currentTodo.description
              }</textarea>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="todo-completed" ${
                this.currentTodo.completed == 1 ? "checked" : ""
              }>
              <label class="form-check-label" for="todo-completed">erledigt?</label>
            </div>
            <button type="submit" id="todo-submit" class="btn btn-primary" data-id="${
              this.currentTodo.id
            }">Absenden</button>
          </form>
        </div>
      </div>
    `;

    this.container.insertAdjacentHTML("beforeend", html);

    let element = this.container.querySelector("#todo-submit");
    element.addEventListener("click", (event) => {
      event.preventDefault();

      let name = this.container.querySelector("#todo-title").value;
      let description = this.container.querySelector("#todo-description").value;
      let completed = this.container.querySelector("#todo-completed").checked;

      let todo = {
        id: parseInt(event.target.dataset.id),
        name,
        description,
        completed: completed ? 1 : 0,
      };

      if (todo.id > 0) {
        this.updateTodo(todo).then(() => {
          this.changeMode("list");
        });
      }

      if (todo.id === 0) {
        this.setTodo(todo).then(() => {
          this.changeMode("list");
        });
      }
    });
  };

  this.getAllTodos = function () {
    this.apiHandler("http://localhost:8000/api/todos", "GET").then((json) => {
      for (let i = 0; i < json.data.length; i++) {
        this.printTodo(json.data[i]);
      }
    });
  };

  this.setTodo = function (todo) {
    return this.apiHandler("http://localhost:8000/api/todo", "POST", todo).then(
      (json) => {
        return json;
      }
    );
  };

  this.updateTodo = function (todo) {
    return this.apiHandler(
      `http://localhost:8000/api/todo/${todo.id}`,
      "PATCH",
      todo
    ).then((json) => {
      return json;
    });
  };

  this.deleteTodo = function (todo) {
    return this.apiHandler(
      `http://localhost:8000/api/todo/${todo.id}`,
      "DELETE",
      todo
    ).then((json) => {
      return json;
    });
  };

  this.apiHandler = function (url, method, data = null) {
    let params = {};

    if (data !== null) {
      params = {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
    }

    return fetch(url, {
      method,
      cache: "no-cache",
      ...params,
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.error(error);
      });
  };
}

document.addEventListener("DOMContentLoaded", () => {
  let app = new todoApp();
  app.init();
});
