import React from "react";
import { Button, Typography, TextField, Paper, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import ProjectList from '../../libs/projectList';
import Web3 from "../../libs/web3";

const styles = {
  contianer: {
    margin: "0 auto",
    width: "60%",
    padding: "20px"
  }
};

class Create extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      description: "",
      minInvest: "",
      maxInvest: "",
      goal: "",
      errmsg: "",
      loading: false
    };

 }

//   输入框数据改变时的逻辑
  inputChangeHandler(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

//   创建新的合约
async createProject() {

    const { description, minInvest, maxInvest, goal } = this.state;

    // 检查 
    if(!description) {
        return this.setState({errmsg: '项目名称不能为空'});
    }
    if(minInvest <= 0 || maxInvest <= 0) {
        return this.setState({errmsg: '限额不能为0'});
    }
    if(goal <= 0) {
        return this.setState({errmsg: '募资上限不能小于0'});
    }
    if(minInvest >= maxInvest) {
        return this.setState({errmsg: '项目最小投资额度不能大于项目最大投资额度'});
    }

    const minInvestInWei = Web3.utils.toWei(minInvest, 'ether');
    const maxInvestInwei = Web3.utils.toWei(maxInvest, 'ether');
    const goalInWei = Web3.utils.toWei(goal, 'ether');
    // const minInvestInWei = web3.toWei(minInvest, 'ether');
    // const maxInvestInwei = web3.toWei(maxInvest, 'ether');
    // const goalInWei = web3.toWei(goalInWei, 'ether');

    try {
        this.setState({loading: true});

        // 获取账户
        const accounts = await Web3.eth.getAccounts();
        const owner = accounts[0];

        // 发送创建项目的请求
        const result = await ProjectList.methods.createProject(description, minInvestInWei, maxInvestInwei, goalInWei).send({from: owner, gas: '1000000'});
        console.log('result', result);
        this.setState({errmsg: '项目创建成功'});
    } catch(err) {
        console.log(err);
        this.setState({errmsg: err.message || err.toString});
    } finally {
        this.setState({loading: false});
    }
}

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.contianer}>
        <Typography variant="title">创建项目</Typography>
        <form>
          <TextField
            fullWidth
            required
            id="description"
            value={this.state.description}
            label="项目名称"
            margin="normal"
            onChange={e => this.inputChangeHandler("description", e)}
          />
          <TextField
            fullWidth
            required
            id="minInvest"
            value={this.state.minInvest}
            onChange={e => this.inputChangeHandler("minInvest", e)}
            InputProps={{ endAdornment: "ETH" }}
            margin="normal"
            label="最小投资金额"
          />
          <TextField
            fullWidth
            required
            id="maxInvest"
            value={this.state.maxInvest}
            InputProps={{ endAdornment: "ETH" }}
            onChange={e => this.inputChangeHandler("maxInvest", e)}
            margin="normal"
            label="最大投资金额"
          />
          <TextField
            fullWidth
            required
            id="goal"
            value={this.state.goal}
            InputProps={{ endAdornment: "ETH" }}
            onChange={e => this.inputChangeHandler("goal", e)}
            margin="normal"
            label="募资上限"
          />
        </form>
        <Button variant="raised" size="large" color="primary" onClick={()=>this.createProject()}>
          {this.state.loading ? <CircularProgress color="secondary" size={24} />: '创建项目'}
        </Button>
        {this.state.errmsg && (
            <Typography component="p" style={{color: 'red', marginTop: '10px'}}>{this.state.errmsg}</Typography>
        )}
      </Paper>
    );
  }
}

export default withStyles(styles)(Create);
