import loadable, { LoadableComponent } from '@loadable/component'

export interface IChildrenRouter {
  path: string
  exact: boolean
  name: string
  label: string
  component: LoadableComponent<any>
}

export interface IRouter {
  path: string
  exact: boolean
  name: string
  label: string
  component: LoadableComponent<any>
  children?: IChildrenRouter[]
}

const router: IRouter[] = [
  {
    path: '/',
    exact: true,
    name: 'homepage',
    label: '主页',
    component: loadable(() => import('../screens/HomePage'))
  },
  {
    path: '/odl/:id',
    exact: false,
    name: 'console',
    label: 'odl实例控制台',
    component: loadable(() => import('../screens/Odl'))
  },
]

export default router