const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
var addDays = require("date-fns/addDays");
var format = require("date-fns/format");

app.use(express.json());

let db = null;
let dbPath = path.join(__dirname, "todoApplication.db");

const initialization = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(`Error: ${e}`);
    process.exit(1);
  }
};
initialization();

const statusAndPriority = (status, priority) => {
  return status !== undefined && priority !== undefined;
};

const categoryAndStatus = (category, status) => {
  return category !== undefined && status !== undefined;
};
const categoryAndPriority = (category, priority) => {
  return category !== undefined && priority !== undefined;
};

const checkStatus = (status) => {
  const possible_status_value = ["TO DO", "IN PROGRESS", "DONE"];
  let status_s = possible_status_value.includes(status);
  return status_s;
};

const checkPriority = (priority) => {
  const possible_priority_value = ["HIGH", "MEDIUM", "LOW"];
  let priority_s = possible_priority_value.includes(priority);
  return priority_s;
};

const checkCategory = (category) => {
  const possible_category_value = ["WORK", "HOME", "LEARNING"];
  let category_s = possible_category_value.includes(category);
  return category_s;
};

const checkTodo = (todo) => {
  const isEmpty = todo.length > 0;
  //console.log(isEmpty, isString);
  return isEmpty;
};

const checkDate = (date) => {
  const dateArray = date.split("-");
  if (dateArray.length === 3) {
    const yearCheck = dateArray[0].length === 4;
    const date_check = dateArray[2].length === 2 || dateArray[2].length === 1;
    const monthCheck = dateArray[1].length === 2 || dateArray[1].length === 1;
    if (yearCheck && date_check && monthCheck) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const checkForData1 = (req, res, next) => {
  const { status, priority, category } = req.query;
  let status_s;
  let priority_s;
  let category_s;
  if (status === undefined) {
    status_s = true;
  } else {
    if (checkStatus(status)) {
      status_s = true;
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
  }
  if (priority === undefined) {
    priority_s = true;
  } else {
    if (checkPriority(priority)) {
      priority_s = true;
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
  }
  if (category === undefined) {
    category_s = true;
  } else {
    if (checkCategory(category)) {
      category_s = true;
    } else {
      res.status(400);
      res.send("Invalid Todo Category");
    }
  }
  if (status_s && priority_s && category_s) {
    next();
  }
};

const checkForData2 = (req, res, next) => {
  const { date } = req.query;
  let date_s;
  if (checkDate(date)) {
    next();
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
};

const checkForData3 = (req, res, next) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  let todo_s;
  let status_s;
  let priority_s;
  let category_s;
  let dueDate_s;

  if (checkTodo(todo)) {
    todo_s = true;
  } else {
    res.status(400);
    res.send("Invalid Todo");
  }

  if (checkStatus(status)) {
    status_s = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Status");
  }

  if (checkPriority(priority)) {
    priority_s = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Priority");
  }
  if (checkCategory(category)) {
    category_s = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Category");
  }
  if (checkDate(dueDate)) {
    dueDate_s = true;
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
  if (status_s && priority_s && category_s && dueDate_s && todo_s) {
    next();
  }
};

//api-1
app.get("/todos/", checkForData1, async (req, res) => {
  const { status, priority, search_q = "", category } = req.query;
  //console.log(category, status);
  switch (true) {
    case statusAndPriority(status, priority):
      const query1 = `SELECT 
      id, todo, priority,category, status, due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND priority = '${priority}'
            AND status = '${status}';`;
      const getArray1 = await db.all(query1);
      res.send(getArray1);

      break;
    case categoryAndStatus(category, status):
      const query2 = `SELECT 
      id, todo, priority,category, status, due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND category = '${category}'
            AND status = '${status}';`;
      const getArray2 = await db.all(query2);
      res.send(getArray2);

      break;
    case categoryAndPriority(category, priority):
      const query3 = `SELECT 
      id, todo, priority,category, status, due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND category = '${category}'
            AND priority = '${priority}';`;
      const getArray3 = await db.all(query3);
      res.send(getArray3);
      break;
    case status !== undefined:
      const query4 = `SELECT 
          id, todo,priority,category,status,due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND status = '${status}';`;
      const getArray4 = await db.all(query4);
      res.send(getArray4);
      break;
    case priority !== undefined:
      const query5 = `SELECT 
        id,
        todo,
        priority,
        category,
        status,
        due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND priority = '${priority}';`;
      const getArray5 = await db.all(query5);
      res.send(getArray5);
      break;
    case category !== undefined:
      const query6 = `SELECT 
      id, todo, priority,category, status, due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%"
            AND category = '${category}'`;
      const getArray6 = await db.all(query6);
      res.send(getArray6);
      break;
    default:
      const query7 = `SELECT 
      id, todo, priority,category, status, due_date as dueDate
        FROM todo 
        WHERE 
            todo LIKE "%${search_q}%";`;
      const getArray7 = await db.all(query7);
      res.send(getArray7);
      break;
  }
});

//api-2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `SELECT 
  id, todo, priority,category, status, due_date as dueDate
  FROM 
    todo 
  WHERE 
    id = ${todoId};`;
  const getArray = await db.get(query);
  res.send(getArray);
});

//api-3
app.get("/agenda/", checkForData2, async (req, res) => {
  const { date } = req.query;
  //console.log(date, typeof date);
  const newFullDate = new Date(date);
  //console.log(newFullDate);

  let dateString = format(newFullDate, "yyyy-MM-dd");
  //console.log(dateString);
  const dateArray = `
  SELECT 
  id, todo,priority,status,category,due_date as dueDate
  FROM
  todo
  WHERE
  due_date LIKE "${dateString}";`;

  const getArray = await db.get(dateArray);
  res.send(getArray);
});

//api-4
app.post("/todos/", checkForData3, async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  const query = `INSERT INTO 
  todo(id, todo, priority, status, category, due_date)
  VALUES 
  (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await db.run(query);
  res.send("Todo Successfully Added");
});

//api-5
app.put("/todos/:todoId/", async (req, res) => {
  const { todo, priority, status, category, dueDate } = req.body;

  switch (true) {
    case status !== undefined:
      if (checkStatus(status)) {
        const query1 = `UPDATE todo 
        SET 
        status = '${status}';`;
        await db.run(query1);
        res.send("Status Updated");
      } else {
        res.status(400);
        res.send("Invalid Todo Status");
      }
      break;

    case category !== undefined:
      if (checkCategory(category)) {
        const query2 = `UPDATE todo 
        SET 
        category = '${category}';`;
        await db.run(query2);
        res.send("Category Updated");
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
      break;

    case priority !== undefined:
      if (checkPriority(priority)) {
        const query3 = `UPDATE todo 
        SET 
        priority = '${priority}';`;
        await db.run(query3);
        res.send("Priority Updated");
      } else {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
      break;

    case dueDate !== undefined:
      if (checkDate(dueDate)) {
        const query4 = `UPDATE todo 
        SET 
        due_date = '${dueDate}';`;
        await db.run(query4);
        res.send("Due Date Updated");
      } else {
        res.status(400);
        res.send("Invalid Due Date");
      }
      break;
    case todo !== undefined:
      if (checkTodo(todo)) {
        const query5 = `UPDATE todo 
        SET 
        todo = '${todo}';`;
        await db.run(query5);
        res.send("Todo Updated");
      } else {
        res.status(400);
        res.send("Invalid Todo");
      }
      break;
  }
});

//api-6
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `DELETE FROM todo 
    WHERE 
        id = ${todoId};`;
  await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
