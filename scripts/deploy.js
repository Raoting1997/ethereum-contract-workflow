const fs = require('fs-extra');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

// 1.拿到 bytecode 
const contractPath = path.resolve(__dirname, '../compiled/ProjectList.json');
const { bytecode, interface } = require(contractPath);

// 2.配置 provider
// 初始化了 使用 infura 提供的 HTTP 接口的 测试网入口以及助记词钱包的 provider，这里的钱包助记词是 metamask 的钱包助记词
const provider = new HDWalletProvider(
    'cover weird planet debris thrive feed zoo music shock pudding electric dad',
    'https://rinkeby.infura.io/v3/3b4b5a1ae2c448bb98ad7a961e1be288'
);

// 3.初始化 web3 实例
// 使用 步骤2 中配置好的插件实例生成新的 Web3 实例
const web3 = new Web3(provider);

(async() => {
    // 4.获取钱包里面的账户
    // 使用 web3.eth.getAccounts() 方法解锁助记词钱包里面的第一个账户作为部署合约的账户
    const accounts = await web3.eth.getAccounts();
    console.log('合约部署账户', accounts[0]);

    // 5.创建合约实例并且部署
    // 初始化了合约、部署、交易发送
    console.time('合约部署耗时');
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '7000000', gasPrice: '2000000000' });

    // console.log('合约部署成功：', result);
    console.timeEnd('合约部署耗时'); 

    const contractAddress = result.options.address;
    console.log('合约部署成功', contractAddress);
    console.log('合约查看网址', `https://rinkeby.etherscan.io/address/${contractAddress}`);

    // 6.合约地址写入文件系统
    const addressFile = path.resolve(__dirname, '../address.json');
    fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
    console.log('地址写入成功', addressFile);

    process.exit();
})();