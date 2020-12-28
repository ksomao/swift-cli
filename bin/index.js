#!/usr/bin/env node
const mysql = require('mysql');
const template = require("../views/templates")
const fs = require("fs")
const path = require('path')
const {exec, execSync} = require('child_process');

let PAGE_FOLDER = "./pages/"
let VIEW_FOLDER = "./views/"
let SASS_FOLDER = "./src/sass/"

let VIEW_PAGES_FOLDER = VIEW_FOLDER + '/pages/'
let SASS_PAGES_FOLDER = SASS_FOLDER + '/pages/'

let CWD = process.cwd()

let wpspeed = {
    init: (args) => {
        let command = args[0], pageName = args[1]

        switch (command) {
            case '-p':
                wpspeed.createPage(pageName)
                break;
            case 'new':
                wpspeed.createProject()
                break;
            case 'clean':
                wpspeed.clean()
                break;
            case 'install':
                wpspeed.install()
                break;

            case 'clear':
                wpspeed.clear()
                break;
        }
    },

    getPath: (folder, file) => {
        return path.join(CWD, folder, file)
    },

    createProject: async () => {
        console.log('downloading wordpress...')
        console.log('unziping wordpress...')
        execSync('curl -LO https://wordpress.org/latest.zip')
        execSync('unzip latest.zip')
        console.log('downloading composer it may take some time...')
        exec('curl -sS https://getcomposer.org/installer | php ', (err, sdout) => {
            console.log('composer.phar added to your project !')
            console.log('cloning wpTheme Starter')
            execSync('git clone https://github.com/ksomao/wptheme_starter.git')
            execSync('cp -r wordpress/* ./')
            execSync('cp -r wptheme_starter ./wp-content/themes/')
            console.log('project successfully created ')
            console.log('removing unused files...')
            execSync('rm latest.zip')
            execSync('rm -rf wordpress')
            execSync('rm -rf wptheme_starter')
            execSync('mv composer.phar ./wp-content/themes/wptheme_starter/')
            console.log('Welcome to WPSPEEEEEEEED')
            console.log('BRAH')
            console.log('Next step go to "cd ./wp-content/themes/wptheme_starter/" \n' +
                'and run the "wpspeed install" command to start the adventure')
            process.exit(0)
        })
    },

    install: () => {
        execSync('rm -rf node_modules')
        execSync('rm -rf vendor')
        console.log('installing composer dependencies')
        execSync('php composer.phar install')
        console.log('installing node dependencies')
        execSync('npm install')
        console.log('Now You need create your database and you good')
    },

    clear: () => {
        try {
            execSync('rm composer.lock')
            execSync('rm package-lock.json')
        } catch (e) {
            console.log('.lock files removed')
        }
    },

    createPage: (name) => {
        let page = wpspeed.getPath(PAGE_FOLDER, `${name}.php`)
        let view = wpspeed.getPath(VIEW_PAGES_FOLDER, `${name}.twig`)
        let sass = wpspeed.getPath(SASS_PAGES_FOLDER, `${name}.scss`)

        const pageContent = template.page(name)

        wpspeed.createFile({path: page, content: pageContent})
        wpspeed.createFile({path: sass, content: '', name: name})
        wpspeed.createFile({path: view, content: '',})
    },

    beforeClean: () => {
        execSync('shopt -s extglob)')
    },

    clean: () => {
        exec("rm -rf .")
    },

    createFile: (file) => {
        fs.writeFile(file.path, file.content, 'utf8', err => {
            if (err) console.log(err)
            if (file.path.includes('scss')) {
                let mainFileSass = wpspeed.getPath(SASS_FOLDER, "style.scss")
                let newContent = `@import 'pages/${file.name}';`

                wpspeed.appendNewContentToFile({
                    fileToRead: mainFileSass,
                    fileName: file.name,
                    contentToInsert: newContent,
                    afterString: '//**VIEW**//',
                    beginToIndex: 16,
                })
            }
            console.log(file.path + " successfully created !")
        })
    },

    appendNewContentToFile: (data) => {
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
}

let terminalArgs = process.argv.splice(2)
wpspeed.init(terminalArgs)


