#!/usr/bin/env node
const template = require("../views/templates")
const fs = require("fs")
const path = require('path')
const {exec, execSync, spawn} = require('child_process');
const prompts = require('prompts');
const process = require('process');
const mysql = require('mysql');


class Swift {

    constructor() {
        this.CWD = process.cwd()
        this.PAGE_FOLDER = "./pages/"
        this.VIEW_FOLDER = "./views/"
        this.SASS_FOLDER = "./src/sass/"

        this.VIEW_PAGES_FOLDER = this.VIEW_FOLDER + '/pages/'
        this.SASS_PAGES_FOLDER = this.SASS_FOLDER + '/pages/'
    }

    exec(args) {
        let command = args[0], name = args[1]

        switch (command) {
            case 'page':
                this.createPage(name)
                break;
            case 'new':
                this.new()
                break;
            case 'clean':
                this.clean()
                break;
            case 'install':
                this.install()
                break;
            case 'clear':
                this.clear()
                break;
            case 'db':
                this.database(name)
                break;
            case 'test':
                this.test()
                break;
        }
    }

    getPath(folder, file) {
        return path.join(this.CWD, folder, file)
    }

    async database() {
        let questions = [
            {
                type: 'text',
                name: 'host',
                message: 'hostname'
            },
            {
                type: 'text',
                name: 'user',
                message: 'user'
            },
            {
                type: 'password',
                name: 'password',
                message: 'password'
            },
            {
                type: 'number',
                name: 'port',
                message: 'port '
            },
            {
                type: 'text',
                name: 'database',
                message: 'database name'
            },
        ]

        const response = await prompts(questions)

        if (response) {
            try {
                let connection = mysql.createConnection({
                    host: response.host,
                    user: response.user,
                    password: response.password,
                });

                connection.connect((err) => {
                    if (err) throw err;
                    console.log("Connected!");
                    connection.query(`CREATE DATABASE ${response.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`, (err) => {
                        if (err) throw err;
                        console.log("Database created");
                        connection.end()
                    });
                });
            } catch (e) {
                console.log(e)
            }
        }
    }

    async new() {
        try {
            console.log('downloading wordpress...')
            execSync('curl -LO https://wordpress.org/latest.zip')
            console.log('unziping wordpress...')
            execSync('unzip latest.zip')
            console.log('downloading composer it may take some time...')
            exec('curl -sS https://getcomposer.org/installer | php ', (err, sdout) => {
                console.log('composer.phar added to your project !')
                execSync('git clone https://github.com/ksomao/swift.git')
                execSync('cp -r wordpress/* ./')
                execSync('cp -r swift ./wp-content/themes/')
                console.log('moving composer file')
                execSync('mv composer.phar ./wp-content/themes/swift/')
                console.log('project successfully created ')
                console.log('removing unused files...')
                execSync('rm latest.zip')
                execSync('rm -rf wordpress')
                execSync('rm -rf swift')
                console.log('Welcome to swift')
                console.log('Next step go to theme swift folder : cd ./wp-content/themes/swift/ \n' +
                    'and run the "swift install" command to start the adventure')
                process.exit(0)
            })
        } catch (e) {
            console.log("try to 'swift clean', then 'swift new' to reinstall")
        }

    }

    install() {
        console.log('installing composer dependencies')
        execSync('php composer.phar install')
        console.log('installing node dependencies')
        execSync('npm install')
        console.log('Now You need create your database and you good')
    }


    createPage(name) {
        let page = this.getPath(this.PAGE_FOLDER, `${name}.php`)
        let view = this.getPath(this.VIEW_PAGES_FOLDER, `${name}.twig`)
        let sass = this.getPath(this.SASS_PAGES_FOLDER, `${name}.scss`)

        const pageContent = template.page(name)

        this.createFile({path: page, content: pageContent})
        this.createFile({path: sass, content: '', name: name})
        this.createFile({path: view, content: ''})
    }

    async clean() {
        let onCancel = () => {
            console.log('files not removed')
        }
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            initial: true,
            message: `Be careful You really want to remove this folder '${this.CWD}' and its files`
        }, {onCancel});

        try {
            if (response.value) {
                execSync('rm -R ./*')
                console.log('files removed from your project')
            }
        } catch (e) {
            console.log("something went wrong all files couldn't be deleted. try again swift clean")
        }
    }

    createFile(file) {
        try {
            fs.writeFile(file.path, file.content, 'utf8', err => {
                if (err) console.log(err)
                if (file.path.includes('scss')) {
                    let mainFileSass = this.getPath(this.SASS_FOLDER, "style.scss")
                    let newContent = `@import 'pages/${file.name}';`

                    this.appendNewContentToFile({
                        fileToRead: mainFileSass,
                        fileName: file.name,
                        contentToInsert: newContent,
                        afterString: '//**VIEW**//',
                        beginToIndex: 16,
                    })
                }
                console.log(file.path + " successfully created !")
            })

        } catch (e) {
            console.log(e)
        }
    }

    appendNewContentToFile(data) {
        let file = fs.readFileSync(data.fileToRead)
        let fileContentToArray = file.toString().split("\n")
        let line = fileContentToArray.indexOf(data.afterString, data.beginToIndex)
        fileContentToArray.splice(++line, 0, data.contentToInsert)
        let newContent = fileContentToArray.join("\n")

        fs.writeFile(data.fileToRead, newContent, 'utf8', err => {
            if (err) console.log(err)
            console.log(`${data.fileName}.scss has been added to style.scss`);
        })
    }

    async test() {}
}

let arguments = process.argv.splice(2)
let swift = new Swift();
swift.exec(arguments)


