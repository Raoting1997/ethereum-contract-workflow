import React from "react";
import {
  Grid,
  Button,
  Typography,
  LinearProgress,
  Paper,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow
} from "@material-ui/core";

import { Link } from "../../routes";
import Project from "../../libs/project";
import ProjectList from "../../libs/projectList";
import Web3 from "../../libs/web3";
import withRoot from "../../libs/withRoots";
import Layout from "../../components/Layout";
import InfoBlock from "../../components/InfoBlock";

class ProjectDetail extends React.Component {
  static async getInitialProps({ query }) {
    const contract = Project(query.address);
    const summaryList = await contract
      .methods.getSummary()
      .call();
    const [
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner
    ] = Object.values(summaryList);

    const tasks =[];
    for(let i; i<paymentCount; i++) {
      tasks.push(contract.methods.payments(i).call());
    }

    console.log('tasks', tasks);
    console.log('paymentCount', paymentCount);    

    const payments = await Promise.all(tasks);

    const project = {
      address: query.address,
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
      payments
    };
    return { project };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: "",
      errmsg: "",
      loading: false
    };
  }

  async investHandler() {
    const amount = this.state.amount;
    const { minInvest, maxInvest } = this.props;
    const minInvestInEther = Web3.utils.fromWei("1000000", "ether");
    const maxInvestInEther = Web3.utils.fromWei(
      "100000000000000000000",
      "ether"
    );
    // const minInvestInEther = Web3.utils.fromWei(minInvest, 'ether');
    // const maxInvestInEther = Web3.utils.fromWei(maxInvest, 'ether');

    //检查
    if (!amount) {
      this.setState({ errmsg: "投资金额不能为空" });
    }
    if (amount < minInvestInEther) {
      return this.setState({ errmsg: "投资金额不能小于最小限额" });
    }
    if (amount > maxInvestInEther) {
      return this.setState({ errmsg: "投资金额不能大于最大限额" });
    }

    try {
      // 获取用户
      const accounts = await Web3.eth.getAccounts();
      const owner = accounts[0];

      // 发起转账
      const contract = Project(this.props.project.address);
      const result = await contract.methods.contribute().send({
        from: owner,
        value: Web3.utils.toWei(amount, "ether"),
        gas: "5000000"
      });
      this.setState({
        errmsg: "投资成功",
        amount: 0
      });
    } catch (err) {
      console.log(err);

      this.setState({ errmsg: err.message || err.toString });
    } finally {
      this.setState({
        loading: false
      });
    }
  }

  inputChangeHandler(e) {
    this.setState({
      amount: e.target.value
    });
  }

  render() {
    const { project } = this.props;

    return (
      <Layout>
        <Typography
          variant="title"
          color="inherit"
          style={{ margin: "15px 0" }}
        >
          项目详情
        </Typography>
        {this.renderBasicInfo(project)}
        <Typography
          variant="title"
          color="inherit"
          style={{ margin: "30px 0 15px" }}
        >
          资金支出请求
        </Typography>
        {this.renderPayments(project)}
      </Layout>
    );
  }

  renderBasicInfo(project) {
    const progress = (project.balance / project.goal) * 100;

    return (
      <Paper style={{ width: "60%", margin: "20px auto", padding: "15px" }}>
        <Typography gutterBottom variant="headline" Component="h2">
          {project.description}
        </Typography>
        <LinearProgress
          color="primary"
          variant="determinate"
          value={progress}
        />
        <Grid container spacing={16}>
          <InfoBlock
            title={`${Web3.utils.fromWei(project.goal, "ether")} ETH`}
            description="募资上限"
          />
          <InfoBlock
            title={`${Web3.utils.fromWei(project.minInvest, "ether")} ETH`}
            description="最小投资金额"
          />
          <InfoBlock
            title={`${Web3.utils.fromWei(project.maxInvest, "ether")} ETH`}
            description="最大投资金额"
          />
          <InfoBlock
            title={`${Web3.utils.fromWei(project.balance, "ether")} ETH`}
            description="已募资金额"
          />
          <InfoBlock
            title={`${project.investorCount} 人`}
            description="投资人数"
          />
        </Grid>
        <TextField
          width="200px"
          required
          value={this.state.amount}
          label="投资金额"
          style={{ marginRight: "15px" }}
          onChange={e => this.inputChangeHandler(e)}
          InputProps={{ endAdornment: "ETH" }}
        />
        <Button
          variant="raised"
          color="primary"
          onClick={() => this.investHandler()}
        >
          {this.state.loading ? (
            <CircularProgress size={24} color="secondary" />
          ) : (
            "立即投资"
          )}
        </Button>
        {!!this.state.errmsg && (
          <Typography component="p" style={{ color: "red" }}>
            {this.state.errmsg}
          </Typography>
        )}
      </Paper>
    );
  }

  renderPayments(project) {
    console.log(project);

    return (
      <Paper style={{ padding: "15px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>支出理由</TableCell>
              <TableCell numeric>支出金额</TableCell>
              <TableCell>收款人</TableCell>
              <TableCell>是否完成</TableCell>
              <TableCell>投票状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {project.payments.map((payment)=>(
                <TableRow>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>{Web3.utils.fromWei(payment.amount, 'ether')} ETH</TableCell>
                  <TableCell>{payment.receiver}</TableCell>
                  <TableCell>{payment.isCompleted ? '是':'否'}</TableCell>
                  <TableCell>{payment.voterCount/project.investorCount}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Link route={`/projects/${project.address}/payments/create`}>
          <Button variant="raised" color="primary">
            创建资金支出请求
          </Button>
        </Link>
      </Paper>
    );
  }
}

export default withRoot(ProjectDetail);
