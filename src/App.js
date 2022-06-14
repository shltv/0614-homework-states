import { logDOM } from "@testing-library/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

// button-group
const buttons = [
  {
    type: "all",
    label: "All",
  },
  {
    type: "active",
    label: "Active",
  },
  {
    type: "done",
    label: "Done",
  },
];
let localStorageItems = []
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    let keyOfLocalStorage = localStorage.key(i);
    let jsonObject = JSON.parse(localStorage.getItem(keyOfLocalStorage)) 
    localStorageItems = [...localStorageItems, jsonObject]
  }

const toDoItems = [...localStorageItems].sort((a,b) => {
  return a.addedTime - b.addedTime
});


// helpful links:
// useState crash => https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/
function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [itemToDelete, setItemToDelete] = useState("");
  //arrow declaration => expensive computation ex: API calls
  const [items, setItems] = useState(() => toDoItems);

  const [filterType, setFilterType] = useState("");

  const [itemToSearch, setItemToSearch] = useState("")
  
  const filteredItems = 
    !filterType && !itemToSearch || filterType === "all" && !itemToSearch
      ? items
      : !filterType || filterType === "all" && itemToSearch
      ? items.filter((item) => item.label.includes(itemToSearch))
      : filterType === "active" && !itemToSearch
      ? items.filter((item) => !item.done)
      : filterType === "active" && itemToSearch
      ? items.filter((item) => !item.done && item.label.includes(itemToSearch))
      : filterType === "done" && !itemToSearch
      ? items.filter((item) => item.done)
      : items.filter((item) => item.done && item.label.includes(itemToSearch));

  console.log(filteredItems);
  const handleSearchItem = (event) => {
    setItemToSearch(event.target.value)
  }

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handleAddItem = () => {
    // mutating !WRONG!
    // const oldItems = items;
    // oldItems.push({ label: itemToAdd, key: uuidv4() });
    // setItems(oldItems);

    // not mutating !CORRECT!
    const key = uuidv4()
    const itemToStore = {label: itemToAdd, key: key, addedTime: Date.now()}
    setItems((prevItems) => [
      itemToStore,
      ...prevItems,
    ]);
    localStorage.setItem(key, JSON.stringify(itemToStore))

    setItemToAdd("");
  };

  const handleDelete = ({ key }) => {
    setItemToDelete(key)
    const itemIndex = items.findIndex((item) => item.key === key);
    const leftSideOfAnArray = items.slice(0, itemIndex)
    const rightSideOfAnArray = items.slice(itemIndex + 1, items.length)
    setItems([...leftSideOfAnArray, ...rightSideOfAnArray])
    localStorage.removeItem(key)
  }

  const handleItemDone = ({ key }) => {
    //first way
    // const itemIndex = items.findIndex((item) => item.key === key);
    // const oldItem = items[itemIndex];
    // const newItem = { ...oldItem, done: !oldItem.done };
    // const leftSideOfAnArray = items.slice(0, itemIndex);
    // const rightSideOfAnArray = items.slice(itemIndex + 1, items.length);
    // setItems([...leftSideOfAnArray, newItem, ...rightSideOfAnArray]);

    //  second way
    // const changedItem = items.map((item) => {
    //   if (item.key === key) {
    //     return { ...item, done: item.done ? false : true };
    //   } else return item;
    // });

    //second way updated
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.key === key) {
          localStorage.removeItem(key)
          localStorage.setItem(key, JSON.stringify({...item, done: !item.done})) 
          return { ...item, done: !item.done };
        } else return item;
      })
    );
  };

  const handleFilterItems = (type) => {
    setFilterType(type);
  };

  const handleImportant = ({key}) => {
    
    setItems((prevItems) => 
      prevItems.map((item) => {
        if (item.key === key) {
          localStorage.removeItem(key)
          localStorage.setItem(key, JSON.stringify({...item, importance: !item.importance})) 
          return {...item, importance: !item.importance};
        } else return item;
      })
    )
  }

  const amountDone = items.filter((item) => item.done).length;

  const amountLeft = items.length - amountDone;

  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
        <h2>
          {amountLeft} more to do, {amountDone} done
        </h2>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          value={itemToSearch}
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          onChange={handleSearchItem}
        />
        {/* Item-status-filter */}
        <div className="btn-group">
          {buttons.map((item) => (
            <button
              onClick={() => handleFilterItems(item.type)}
              key={item.type}
              type="button"
              className={`btn btn-${
                filterType !== item.type ? "outline-" : ""
              }info`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List-group */}
      <ul className="list-group todo-list">
        {filteredItems.length > 0 &&
          filteredItems.map((item, index) => (
            <li key={index} className="list-group-item">
              <span className={`todo-list-item${item.done ? " done" : ""}${item.importance ? " important": ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => handleItemDone (item)}
                >
                  {item.label}
                </span>

                <button onClick={() => handleImportant (item)}
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button onClick={() => handleDelete (item)}
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />

        
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;
