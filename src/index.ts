import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map
} from "rxjs";

const input: HTMLInputElement = document.getElementById("todoInput") as any;
const list: HTMLUListElement = document.getElementById("todoList") as any;
const filterInput: HTMLInputElement = document.getElementById(
  "filterInput"
) as any;
const sortInput: HTMLInputElement = document.getElementById("sortInput") as any;
const addTodo: HTMLButtonElement = document.getElementById("addTodo") as any;

const addTodo$ = fromEvent(addTodo, "click").pipe(map(() => input.value));

const filter$ = fromEvent(filterInput, "input").pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  debounceTime(300),
  distinctUntilChanged()
);

const sort$ = fromEvent(sortInput, "change").pipe(
  map((event: Event) => (event.target as HTMLInputElement).value)
);

// Create a todo list subject to manage state
const todoList$ = new BehaviorSubject<string[]>([]);

combineLatest([filter$, sort$]).subscribe(([filterValue, sortValue]) => {
  // Update the todo list based on the input value, filter value, and sort value
  const filteredList = todoList$.value
    .filter((todo) =>
      todo.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())
    )
    .sort((a, b) => {
      if (sortValue === "asc") {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    }); 

  // Update the UI with the filtered and sorted list
  renderTodoList(list, filteredList);
});

// Subscribe to the todoList$ subject to update the UI
todoList$.subscribe((items) => {
  renderTodoList(list, items);
});

// Handle user input and update the todo list
addTodo$.subscribe((value) => {
  if (value.trim() !== "") {
    const updatedList = [...todoList$.value, value];
    todoList$.next(updatedList);
    input.value = "";
  }
});

// Render the todo list in the UI
function renderTodoList(list: HTMLUListElement, items: string[]): void {
  while (list.firstChild != null) {
    list.firstChild.remove();
  }
  list.innerHTML = items.map((todo) => `<li>${todo}</li>`).join("");
}
