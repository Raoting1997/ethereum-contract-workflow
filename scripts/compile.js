const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

// 1.cleanup
const compiledDir = path.resolve(__dirname, '../compiled');
fs.removeSync(compiledDir);
fs.ensureDirSync(compiledDir);

// 2.编译所有的合约。
// 2.1找出所有的合约
const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));

contractFiles.forEach((contractFile)=>{
    // 2.2编译
    const contractPath = path.resolve(__dirname, '../contracts', contractFile);
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    const result = solc.compile(contractSource, 1);

    // 2.2 抛出错误
    if (Array.isArray(result.errors) && result.errors.length) {
        throw new Error(result.errors[0]);
    }

    // 保存编译后的合约
    Object.keys(result.contracts).forEach(name => {
        const contractName = name.replace(/^:/, '');
        const filePath = path.resolve(compiledDir, `${contractName}.json`);
        fs.outputJsonSync(filePath, result.contracts[name]);
        console.log(`save compiled contract ${contractName} to ${filePath}`);
    });
});
