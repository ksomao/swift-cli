const {execSync} = require('child_process');
const questions = require("./questions")
const prompts = require('prompts');
const process = require('process');
const mysql = require('mysql');

class Command {

    constructor(fileManager) {
        this.fileManager = fileManager
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


    async database() {
        const response = await prompts(questions.db)

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
            console.log('composer.phar added to your project !')
            execSync('git clone https://github.com/ksomao/swift.git')
            execSync('cp -r wordpress/* ./')
            execSync('cp -r swift ./wp-content/themes/')
            console.log('moving composer file')
            console.log('project successfully created ')
            console.log('removing unused files...')
            execSync('rm latest.zip')
            execSync('rm -rf wordpress')
            execSync('rm -rf swift')
            console.log('Welcome to swift')
            console.log('Next step go to theme swift folder : cd ./wp-content/themes/swift/ \n' +
                'and run the "swift install" command to start the adventure')
            process.exit(0)
        } catch (e) {
            console.log("try to 'swift clean', then 'swift new' to reinstall")
        }

    }

    install() {
        let afterDowloadingComposer = () => {
            console.log('installing composer dependencies')
            execSync('php composer.phar install')
            console.log('installing node dependencies')
            execSync('npm install')
            console.log('Now You need create your database and you good')
        }
        this.getComposer(afterDowloadingComposer);
    }

    createPage(fileName) {
        this.fileManager.createPageWithViewAndSass(fileName)
    }

    getComposer(callback) {
        this.fileManager.download(
            'https://getcomposer.org/composer-stable.phar', this.fileManager.CWD,
            () => callback()
        );
    }

    async clean() {
        try {
            let onCancel = () => console.log('files not removed')
            let message = `Be careful You really want to remove this folder '${this.fileManager.CWD}' and its files`
            const response = await this.confirmPrompt(message, onCancel);

            if (response.value) {
                execSync('rm -R ./*')
                console.log('files removed from your project')
            }
        } catch (e) {
            console.log("something went wrong all files couldn't be deleted. try again swift clean")
        }
    }

    async confirmPrompt(message, onCancel) {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            initial: true,
            message
        }, {onCancel});
        return response;
    }

    test() {
        console.log('test')
    }
}


module.exports = Command
