USE employees_db;

INSERT INTO department (name) VALUES ("Computer Information Systems");
INSERT INTO department (name) VALUES ("Development");
INSERT INTO department (name) VALUES ("Finance");
INSERT INTO department (name) VALUES ("Legal");
INSERT INTO department (name) VALUES ("Marketing");

INSERT INTO roles (title, salary, department_id) VALUES ("Director", 120000.00);
INSERT INTO roles (title, salary, department_id) VALUES ("Manager", 90000.00);
INSERT INTO roles (title, salary, department_id) VALUES ("Coordinator", 75000.00);
INSERT INTO roles (title, salary, department_id) VALUES ("Specialist", 70000.00);
INSERT INTO roles (title, salary, department_id) VALUES ("Assistant", 60000.00);

INSERT INTO employee (first_name, last_name, role_id) VALUES ("Oscar", "Martinez", 3);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Stanley", "Hudson", 2);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Jan", "Levinson", 1);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Dwight", "Schrute", 5);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Michael", "Scott", 15);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Jim", "Halpert", 12);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Pam", "Beesly", 25);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Creed", "Bratton", 24);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Angela", "Martin", 19);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Phyllis", "Vance", 18);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Kelly", "Kapur", 17);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Kevin", "Malone", 21);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Toby", "Flenderson", 9);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Meredith", "Palmer", 10);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Ryan", "Howard", 6);