import React from "react";
import {
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress
} from "@material-ui/core";

import { Router } from '../../../routes';
import Project from "../../../libs/project";
import Web3 from "../../../libs/web3";
import Layout from "../../../components/Layout";
import withRoot from '../../../libs/withRoots';

class PaymentCreate extends React.Component {
  static async getInitialProps({ query }) {
      const project = Project(query.address);
    const summary = await project.methods.getSummary().call();
    const description = summary[0];
    // 添加管理者，用来做检验
    const owner = summary[7];
    // 获取到该项目的地址与描述信息
    return { project: { address: query.address, description, owner } };
  }

  constructor(props) {
    super(props);

    this.state = {
      description: "",
      amount: 0,
      receiver: '',
      errmsg: "",
      loading: false
    };
  }

  getInputHandler(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

  async createPayment() {
      const { description, amount, receiver } = this.state;
    //   检查
    if(!description) {
        return this.setState({errmsg: '支出理由不能为空'});
    }
    if(amount<=0) {
        return this.setState({errmsg: '支出金额必须大于零'});
    }
    if(receiver <=0) {
        return this.setState({errmsg: '收款人不能为空'});
    }
    // 对地址进行检查
    if(!Web3.utils.isAddress(receiver)) {
        return this.setState({errmsg: '收款人地址不正确'});
    }


    try {
      this.setState({loading: true, errmsg: ''});    
      const amountInWei = Web3.utils.toWei(amount, 'ether');

    // 获取账户
    const accounts = await Web3.eth.getAccounts();
    const owner = accounts[0];
    if(owner !== this.props.project.owner) {
        return window.alert('只有管理员才能创建资金支出请求');
    }

    // 创建支出请求
    const project = Project(this.props.project.address);
    console.log(project);
    const result = await project.methods.createPayment(description, amountInWei, receiver).send({from: owner, gas: '5000000'});
    this.setState({loading: false, errmsg: '资金支出请求创建成功'});  
    setTimeout(()=>{
        Router.pushRoute(`/projects/${this.props.project.address}`);
    }, 1000)  
    } catch(err) {
        console.error(err);
        this.setState({errmsg: err.message || err.toStrinbg});
    } finally {
        this.setState({loading: false});
    }

    
  }

  render() {
    return (
      <Layout>
        <Typography
          variant="title"
          color="inherit"
          style={{ marginTop: "15px" }}
        >
          创建资金支出请求：
          {this.props.project.description}
        </Typography>
        <Paper style={{ padding: "15px" }}>
          <from>
            <TextField
              fullWidth
              required
              margin="normal"
              value={this.state.description}
              label="支出理由"
              id="description"
              onChange={e => this.getInputHandler("description", e)}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              label="支出金额"
              id="amount"
              value={this.state.amount}
              onChange={e => this.getInputHandler("amount", e)}
              InputProps={{ endAdornment: "ETH" }}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              label="收款方"
              id="receiver"
              value={this.state.receiver}
              onChange={e => this.getInputHandler("receiver", e)}
            />
          </from>
          <Button onClick={() => this.createPayment()}>
            {this.state.loading ? <CircularProgress size={24} /> : "保存"}
          </Button>
          {!!this.state.errmsg && (
            <Typography component="p" style={{ margin: "10px", color: "red" }}>
              {this.state.errmsg}
            </Typography>
          )}
        </Paper>
      </Layout>
    );
  }
}

export default withRoot(PaymentCreate);
