const chalk = require("chalk");
const inquirer = require("inquirer");

inquirer
  .prompt([
    { name: "nome", message: "Qual o seu nome?" },
    { name: "idade", message: "Qual a sua idade?" },
  ])
  .then((answers) => {
    const res = `O nome do usuário é: ${answers.nome}. Ele diz ter ${answers.idade} anos.`

    console.log(chalk.bgYellow.black(res))
  })
  .catch((err) => console.log(err));