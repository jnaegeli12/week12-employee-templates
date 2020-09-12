'use strict';

const inquirer = require('inquirer');
const util = require('util');
require('console-table');

const mysql = require('mysql');
const {connect} = require('http2');
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "employees",
    database: "employees_db"
});

connection.query = util.promisify(connection.query);

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);

    startPrompt();
});

function startPrompt() {
    inquirer.prompt({
        type: "list",
        name: "databasetask",
        message: "What would you like to do?",
        choices: [
            "View all roles.",
            "View all departments.",
            "View all employees.",
            "Add an employee.",
            "Add a department.",
            "Add a role.",
            "Update an employee.",
            "Quit"
        ]
    }).then(answers => {

        switch (answers.databasetask) {
            case "View all roles.":
                viewAllRoles();
                break;

            case "View all departments.":
                viewAllDepartments();
                break;

            case "View all employees.":
                viewAllEmployees();
                break;

            case "Add a role.":
                addRole();
                break;

            case "Add a department.":
                addDepartment();
                break;

            case "Add an employee.":
                addEmployee();
                break;

            case "Update an employee.":
                updateEmployee();
                break;

            case "Quit":
                quit();
                break;

            default:
                startPrompt();
        }
    })
};

function viewAllRoles() {
    connection.query(`SELECT roles.title AS role, department.name AS department, employee.first_name, employee.last_name 
    FROM roles 
    INNER JOIN department ON roles.department_id = department.id
    LEFT JOIN employee ON employee.role_id = roles.id;`, function (err, res) {
        if (err) throw err;
        console.log('\n');
        console.table(res);
        console.log('\n');
    });

    startPrompt();
}

function viewAllDepartments() {
    connection.query(`SELECT department.name AS department FROM department ORDER BY name`, function (err, res) {
        if (err) throw err;
        console.log('\n');
        console.table(res);
        console.log('\n');
    });

    startPrompt();
}

async function viewAllEmployees() {
    await inquirer.prompt([{
        type: "list",
        name: "order",
        message: "By what category do you want to order your table?",
        choices: [
            "employee.id",
            "employee.last_name",
            "roles.title",
            "department.name",
            "roles.salary",
            "manager"
        ]
    }]).then(answers => {
        connection.query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS department, roles.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN roles on employee.role_id = roles.id 
        LEFT JOIN department on roles.department_id = department.id 
        LEFT JOIN employee manager on manager.id = employee.manager_id
        ORDER BY ${answers.order}`, function (err, res) {
            if (err) throw err;
            console.log('\n');
            console.table(res);
            console.log('\n');
    
            startPrompt();
        });
    })
};

async function addRole() {
    let deptArray = await connection.query("SELECT * FROM department");
    let departmentChoices = await deptArray.map(({id, name}) => ({name: name, value: id}));

    await inquirer.prompt([{
            type: "list",
            name: "title",
            message: "Role Title:",
            choices: [
                "Director",
                "Manager",
                "Coordinator",
                "Specialist",
                "Assistant"
            ]
        },
        {
            type: "list",
            name: "department_id",
            message: "Department:",
            choices: departmentChoices
        },
        {
            type: "number",
            name: "salary",
            message: "Base salary:"
        }
    ]).then(answers => {
        connection.query("INSERT INTO roles SET ?", answers);
        console.log("New role added!");
        console.log('\n');
        startPrompt();
    })
};

function addDepartment() {
    inquirer.prompt({
        type: "input",
        name: "name",
        message: "Name of new department:"
    }).then(answers => {
        connection.query("INSERT INTO department (name) VALUES (?);", answers.name, function (err, res) {
            if (err) throw err;
        });

        console.log('Department added!');
        console.log('\n');
        startPrompt();
    })
}

async function addEmployee() {
    let deptArray = await connection.query("SELECT * FROM department");
    let departmentChoices = await deptArray.map(({id, name}) => ({name: name, value: id}));

    await inquirer.prompt([{
        type: "input",
        name: "first_name",
        message: "First Name:"
    }, {
        type: "input",
        name: "last_name",
        message: "Last Name:"
    }, {
        type: "list",
        name: "title",
        message: "Role:",
        choices: [
            "Director",
            "Manager",
            "Coordinator",
            "Specialist",
            "Assistant"
        ]
    }, {
        type: "list",
        name: "department",
        message: "Department:",
        choices: departmentChoices
    }]).then(answers => {
        connection.query(`SELECT id FROM roles WHERE title="${answers.title}" and department_id=${answers.department}`, function (err, res) {
            const roleResult = res.map(({id, name}) => ({name: name, value: id}));
            const roleId = roleResult[0].value;
            connection.query(`INSERT INTO employee (first_name, last_name, role_id) VALUES ("${answers.first_name}", "${answers.last_name}", ${roleId})`);
        });
    });
    console.log("Employee added!");
    console.log('\n');
    startPrompt();
};

async function updateEmployee() {
    let employeeArray = await connection.query("SELECT id, CONCAT (employee.first_name, ' ', employee.last_name) AS name FROM employee");
    let employeeChoices = await employeeArray.map(({id, name}) => ({name: name, value: id}));

    await inquirer.prompt([{
        type: "list",
        name: "employees",
        message: "Name of employee you want to update:",
        choices: employeeChoices
    }, {
        type: "list",
        name: "update",
        message: "How do you want to update this employee?",
        choices: [
            "Add/change a manager",
            "Update role",
            "Update salary"
        ]
    }]).then(answers => {
        switch (answers.update) {
            case "Add/change a manager":
                addManager(answers.employees, employeeChoices);
                break;

            case "Update role":
                updateRole(answers.employees);
                break;

            case "Update salary":
                updateSalary(answers.employees);
                break;
        };
    });
};

async function addManager(item, array) {
    await inquirer.prompt([{
        type: "list",
        name: "manager",
        message: "Choose the employee's manager:",
        choices: array
    }]).then(answers => {
        const chosenManager = answers.manager;
        connection.query(`UPDATE employee SET manager_id = ${chosenManager} WHERE id = ${item};`, function (err, res) {
            if (err) throw err;
        });
    });
    console.log("Manager updated!");
    console.log('\n');
    startPrompt();
};

async function updateRole(item) {
    let deptArray = await connection.query("SELECT * FROM department");
    let departmentChoices = await deptArray.map(({id, name}) => ({name: name, value: id}));

    await inquirer.prompt([{
        type: "list",
        name: "title",
        message: "Employee's new role:",
        choices: [
            "Director",
            "Manager",
            "Coordinator",
            "Specialist",
            "Assistant"
        ]
    }, {
        type: "list",
        name: "department",
        message: "Employee's new department:",
        choices: departmentChoices
    }]).then(answers => {
        connection.query(`UPDATE employee 
            SET role_id = (SELECT id FROM roles WHERE title = "${answers.title}" and department_id = ${answers.department}) 
            WHERE id = ${item};`, function (err, res) {
            if (err) throw err;
        });
    });
    console.log("Role updated!");
    console.log('\n');
    startPrompt();
};

async function updateSalary(item) {
    await inquirer.prompt([{
        type: "number",
        name: "salary",
        message: "What is the employee's salary?"
    }]).then(answers => {
        connection.query(`UPDATE roles SET salary = ${answers.salary} WHERE id = (SELECT role_id FROM employee WHERE id = ${item});`, function (err, res) {
            if (err) throw err;
        });
    });
    console.log("Salary updated!");
    console.log('\n');
    startPrompt();
};

function quit() {
    console.log("You are finished.");
    connection.end(function (err) {
        if (err) throw err;
        console.log("The connection is now terminated.");
        console.log('\n');
    });
}