import React from "react";
import Web3 from "../libs/web3";
import {
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  LinearProgress
} from "@material-ui/core";

import { Link } from "../routes";
import withRoot from "../libs/withRoots";
import Layout from "../components/Layout";
import ProjectList from "../libs/projectList";
import Project from "../libs/project";
import InfoBlock from "../components/InfoBlock";

class Index extends React.Component {
  // getInitialProps 是 Next.js 中服务器渲染时获取数据的基本方法，这个方法中输出的内容是在服务器的输出中，而不是在浏览器的输出中
  static async getInitialProps({ req }) {
    const addressList = await ProjectList.methods.getProjects().call();
    const summaryList = await Promise.all(
      addressList.map(address =>
        Project(address)
          .methods.getSummary()
          .call()
      )
    );
    console.log(summaryList);
    const projects = addressList.map((address, i) => {
      // 定义一个数组，这个数组的值是 summaryList[i] 的 values 值，其实就是给数组赋值
      const [
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner
      ] = Object.values(summaryList[i]);
      return {
        address,
        description,
        minInvest,
        maxInvest,
        goal,
        balance,
        investorCount,
        paymentCount,
        owner
      };
    });
    console.log(projects);
    return { projects };
  }

  render() {
    const { projects } = this.props;

    return (
      <Layout>
        <Button color="primary" variant="raised">
          Welcome to Ethereum ICO DApp
        </Button>
        <Grid container spacing={16}>
          {projects && projects.map(project => this.renderProject(project))}
        </Grid>
      </Layout>
    );
  }
  renderProject(project) {
    // 将进度条的显示逻辑放在这里，因为要取得需要的进度，只有在 project 里面才能取到
    const progress = (project.balance / project.goal) * 100;

    return (
      <Grid item md={4} key={project.address}>
        <Card>
          <CardContent>
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
            <Typography component="p">{project.address}</Typography>
          </CardContent>
          <CardActions>
            <Link route={`/projects/${project.address}`}>
              <Button size="small" color="primary">
                立即投资
              </Button>
            </Link>
            <Link route={`/projects/${project.address}`}>
              <Button size="small" color="primary">
                查看详情
              </Button>
            </Link>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}
export default withRoot(Index);
