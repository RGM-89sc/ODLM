import React from 'react'
import { Layout } from 'antd'
import styles from './App.module.scss'
import SideMenu from './components/SideMenu'
import { 
  RouteComponentProps,
  // eslint-disable-next-line
  HashRouter as Router, Route, Switch
} from 'react-router-dom'
import { withRouter } from 'react-router'
import { Path, LocationDescriptorObject } from 'history'
import router, { IRouter } from './router/router'
import { OdlInstane } from './libs/odl.d'
import odlManager from './tools/odlManager'

interface IProps extends RouteComponentProps {}

interface IState {
  odlList: OdlInstane[]
}

class App extends React.Component<IProps, IState> {
  sideMenuRef: React.RefObject<SideMenu>

  constructor(props: IProps) {
    super(props)

    this.state = {
      odlList: odlManager.getOdlList()
    }

    this.sideMenuRef = React.createRef<SideMenu>()

    this.updateOdlList = this.updateOdlList.bind(this)
    this.changeRouteWithPath = this.changeRouteWithPath.bind(this)
    this.changeRouteWithLocationDescObj = this.changeRouteWithLocationDescObj.bind(this)
  }

  updateOdlList (): void {
    this.setState({
      odlList: odlManager.getOdlList()
    }, () => {
      this.sideMenuRef.current?.updateOdlList(this.state.odlList)
    })
  }

  changeRouteWithPath (path: Path): void {
    if (this.props.location.pathname !== path) {
      this.props.history.push(path)
    }
  }

  changeRouteWithLocationDescObj (location: LocationDescriptorObject): void {
    const currentLocation = this.props.location
    if (currentLocation.pathname === location.pathname && 
      currentLocation.search === location.search && 
      currentLocation.hash === location.hash &&
      JSON.stringify(currentLocation.state) === JSON.stringify(location.state)) {
        return
    }
    this.props.history.push(location)
  }

  render() {
    return (
      <Layout>
        <Layout.Sider>
          <SideMenu ref={this.sideMenuRef}
                    odlList={this.state.odlList} 
                    changeRouteWithPath={this.changeRouteWithPath}
                    changeRouteWithLocationDescObj={this.changeRouteWithLocationDescObj}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Content className={styles['content']}>
            <Switch>
              {router.map((route: IRouter) => {
                const RouteComponent = ({ component, ...rest }: any) => {
                  const routeComponentRender = (props: any) => {
                    // 此处assign自定义props传入页面组件
                    const extraProps = {
                      updateOdlList: this.updateOdlList
                    }
                    return React.createElement(component, Object.assign(props, extraProps))
                  }

                  return <Route {...rest} render={routeComponentRender} />
                }

                return (
                  <RouteComponent 
                    key={route.name}
                    path={route.path}
                    name={route.label}
                    exact={route.exact}
                    component={route.component}
                  />
                )
              })}
            </Switch>
          </Layout.Content>
        </Layout>
      </Layout>
    )
  }
}

export default withRouter(App)