const {existsSync, createWriteStream, unlink, mkdirSync} = require('node:fs');
const {join} = require('node:path');
const {get} = require('node:https');


window.preload = {
    customer: {
        // 检查文件是否存在
        checkFileExist(root, dir, file) {
            const filePath = join(root, dir, file);
            return existsSync(filePath);
        },
        downloadFile(root, dir, fileName, url) {
            return new Promise((resolve, reject) => {
                const folder = join(root, dir);
                if (!existsSync(folder)) {
                    mkdirSync(folder, {recursive: true});
                }
                const filePath = join(folder, fileName);
                const file = createWriteStream(filePath);
                get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close(resolve);
                    });
                }).on('error', function (err) {
                    unlink(filePath, () => {
                    });
                    reject(err)
                });
            })
        }
    },
    path: {
        join: join
    }
};
