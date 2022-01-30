const inquirer = require('inquirer');
const db = require('./db');
const logo = require('asciiart-logo');
const { connection } = require('./db');
// const { exit } = require('process');
require('console.table');

function init() {
    console.log(
        logo({
            name: 'Employee Manager',
            font: 'Standard',
            lineChars: 10,
            padding:  3,
            margin: 4,
            borderColor: 'bold-white',
        })
        .emptyLine()
        .render()
    );

    promptUser();
}

function promptUser() {
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                {
                    name: 'View All Employees',
                    value: 'viewEmployees'
                },
                {
                    name: 'Add Employee',
                    value: 'addEmployee'
                },
                {
                    name: 'Update Employee Role',
                    value: 'updateRole'
                },
                {
                    name: 'View All Roles',
                    value: 'viewRoles'
                },
                {
                    name: 'Add Role',
                    value: 'addRole'
                },
                {
                    name: 'View All Departments',
                    value: 'viewDepartments'
                },
                {
                    name: 'Add Department',
                    value: 'addDepartment'
                },
                {
                    name: 'Exit',
                    value: 'Exit'
                },
            ]
        }
        
    ]).then(res => {
        let { choice } = res;

        switch (choice) {
            case 'viewEmployees':
                viewEmployees();
                break;
            case 'addEmployee':
                addEmployee();
                break;
            case 'updateRole':
                updateRole();
                break;
            case 'viewRoles':
                viewRoles();
                break;
            case 'addRole':
                addRole();
                break;
            case 'viewDepartments':
                viewDepartments();
                break;
            case 'addDepartment':
                addDepartment();
                break;    
            case 'Exit':
                exit();
                break;        
        }
    })
}

function viewEmployees() {
    db.viewEmployees()
    .then(([data]) => {
        let employees = data;
        console.log('\n')
        console.table(employees)
    }).then(() => promptUser());
}

function addDepartment() {
    inquirer.prompt([
        {
            name: "name",
            message: "What's the name of the department?"
        }
    ])
        .then(res => {
            let name = res;
            db.addDepartment(name)
                .then(() => console.log(`Added ${name.name} to the database`))
                .then(() => promptUser())
        })
}

function addEmployee() {
    inquirer.prompt([
        {
            name: 'first_Name',
            message: "What is the employee's first name?"
        },
        {
            name: 'last_Name',
            message: "What is the employee's last name?"
        }
    ]).then(res => {
        let firstName = res.first_Name;
        let lastName = res.last_Name;
        
        db.viewRoles()
        .then(([data]) => {
            let roles = data;
            const roleOptions = roles.map(({ id, title }) => ({
                name: title,
                value: id
            }));

            inquirer.prompt({
                type: 'list',
                name: 'role_id',
                message: "What is the employee's role?",
                choices: roleOptions
            }).then(res => {
                let role_id = res.role_id;

                db.viewEmployees()
                .then(([data]) => {
                    let employees = data;
                    const mangOptions = employees.map(({ id, first_Name, last_Name }) => ({
                        name: `${first_Name} ${last_Name}`,
                        value: id
                    }));

                    mangOptions.unshift({ name: "None", value: null });

                    inquirer.prompt({
                        type: 'list',
                        name: 'mang_id',
                        message: "Who is the employee's manager?",
                        choices: mangOptions
                    })

                    .then(res => {
                        let employee = {
                            mang_id: res.mang_id,
                            role_id: role_id,
                            firstName: firstName,
                            lastName: lastName
                        }

                        db.addEmployee(employee);
                    })
                    .then(() => console.log (`Added ${firstName} ${lastName} to the database`))
                    .then(() => promptUser())
                })
            })
        })
    })
}

function updateRole() {
    db.viewEmployees()
    .then(([data]) => {
        let employees = data;
        const employeeOptions = employees.map(({ id, first_Name, last_Name }) => ({
            name: `${first_Name} ${last_Name}`,
            value: id
        }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: "Which employee's role do you want to update?",
                choices: employeeOptions
            }
        ])
        .then(res => {
            let employeeId = res.employeeId;
            db.viewRoles()
            .then(([data]) => {
                let roles = data;
                const roleOptions = roles.map(({ id, title }) => ({
                    name: title,
                    value: id
                }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Which role do you want to assign the selected employee?",
                        choices: roleOptions
                    }
                ])
                .then(res => db.updateRole(employeeId, res.role_id))
                .then(() => console.log("Updated employee's role"))
                .then(() => promptUser())
            });
        })
    })
}

function viewRoles() {
    db.viewRoles()
    .then(([data]) => {
        let roles = data;
        console.log('\n')
        console.table(roles)
    }).then(() => promptUser());
}

function addRole() {
    db.viewDepartments()
    .then(([data]) => {
        let departments = data;
        const departmentOptions = departments.map(({ id, name }) => ({
            name: name,
            value: id
        }));
        inquirer.prompt([
            {
                name: 'title',
                message: "What is the name of the role?"
            },
            {
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Which department does the role belong to?',
                choices: departmentOptions
            }
        ])
        .then(role => {
            db.addRole(role)
            .then(() => console.log(`Add ${role.title} to the database`))
            .then(() => promptUser())
        })
    })
}

function viewDepartments() {
    db.viewDepartments()
    .then(([data]) => {
        let departments = data;
        console.log('\n')
        console.table(departments)
    })
    .then(() => promptUser());
}

function exit() {
    console.log('Goodbye')
    connection.end();
}

init();