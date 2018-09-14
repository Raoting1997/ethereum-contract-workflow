import web3 from './web3';
import ProjectList from '../compiled/ProjectList.json';
import address from '../address';

// 生成 projectList 合约的实例，传入地址之后不用再部署
const contract = new web3.eth.Contract(JSON.parse(ProjectList.interface), address);

export default contract;