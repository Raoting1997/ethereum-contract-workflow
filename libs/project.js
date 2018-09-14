import web3 from '../libs/web3';
import Project from '../compiled/Project.json';

const getContract = address => {
    return new web3.eth.Contract(JSON.parse(Project.interface), address);
}

export default getContract;
