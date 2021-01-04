#!/usr/bin/env node
const {DownloaderHelper} = require('node-downloader-helper');
const {execSync} = require('child_process');
const template = require("../views/templates")
const path = require('path')
const fs = require("fs")


class FileManager {
    constructor(fileManager) {
        this.CWD = process.cwd()
        this.PAGE_FOLDER = "./pages/"
        this.VIEW_FOLDER = "./views/"
        this.SASS_FOLDER = "./src/sass/"
        this.MAIN_SCSS_FILE = "style.scss"

        this.VIEW_PAGES_FOLDER = this.VIEW_FOLDER + '/pages/'
        this.SASS_PAGES_FOLDER = this.SASS_FOLDER + '/pages/'
    }

    getPath(folder, file) {
        return path.join(this.CWD, folder, file)
    }

    createPageWithViewAndSass(name) {
        let page = this.getPath(this.PAGE_FOLDER, `${name}.php`)
        let view = this.getPath(this.VIEW_PAGES_FOLDER, `${name}.twig`)
        let sass = this.getPath(this.SASS_PAGES_FOLDER, `${name}.scss`)

        const pageContent = template.page(name)

        this.createFile({path: page, content: pageContent})
        this.createFile({path: sass, content: '', name: name})
        this.createFile({path: view, content: ''})
    }

    createFile(file) {
        try {
            fs.writeFile(file.path, file.content, 'utf8', err => {
                if (err) console.log(err)
                if (file.path.includes('scss')) {
                    this.addNewSassFileToMainSassFile(file);
                }
                console.log(file.path + " successfully created !")
            })
        } catch (e) {
            console.log(e)
        }
    }

    addNewSassFileToMainSassFile(file) {
        let mainFileSass = this.getPath(this.SASS_FOLDER, this.MAIN_SCSS_FILE)
        let newContent = `@import 'pages/${file.name}';`

        this.appendNewContentToFile({
            filePath: mainFileSass,
            fileName: file.name,
            contentToInsert: newContent,
            afterString: '//**VIEW**//',
            beginToIndex: 16,
        })
    }

    appendNewContentToFile(data) {
        let {filePath, fileName, contentToInsert, afterString, beginToIndex} = data
        let file = this.getFile(filePath);

        let fileUpdated = this.addLineToFile(file, {
            afterString,
            contentToInsert,
            beginToIndex
        });

        let success = () => console.log(`${fileName}.scss has been added to style.scss`)
        this.overwriteFileContent(filePath, fileUpdated, success);
    }


    overwriteFileContent(filePath, fileUpdated, callback) {
        fs.writeFile(filePath, fileUpdated, 'utf8', err => {
            if (err) console.log(err)
            callback()
        })
    }

    addLineToFile(file, options) {
        let {afterString, contentToInsert, beginToIndex} = options
        let fileContentToArray = file.toString().split("\n")
        let line = fileContentToArray.indexOf(afterString, beginToIndex)
        fileContentToArray.splice(++line, 0, contentToInsert)
        return fileContentToArray.join("\n");
    }

    getFile(filePath) {
        let file = fs.readFileSync(filePath)
        return file;
    }

    download(url, path, callback) {
        const dl = new DownloaderHelper(url, path);
        dl.start();
        dl.on('end', () => callback())
    }
}

module.exports = FileManager


