import { AxiosInstance, AxiosResponse, Method } from 'axios'
import { RestconfModuleInfo } from '../../../libs/odl.d'
import xmlTools from '../../../tools/xmlTools'

export default (axios: AxiosInstance) => {
  return {
    getRestconfModules: (): Promise<RestconfModuleInfo[]> => {
      return axios.get('restconf/modules')
        .then((res: AxiosResponse) => {
          if (res.status === 200) {
            return res.data.modules.module
          }
          return []
        })
        .catch((e: Error) => {

        })
    },

    getModuleRestApi: (module: string, revision: string): Promise<any[]> => {
      return axios.get(`restconf/modules/module/${module}/${revision}/schema`)
        .then((res: AxiosResponse) => {
          if (res.status === 200) {
            return xmlTools.getApis(res.data)
          }
          return []
        })
        .catch((e: Error) => {
          return []
        })
    },

    // getRestApis: function () {
    //   this.getRestconfModules()
    //     .then((modules: RestconfModuleInfo[]) => {
    //       if (modules.length > 0) {
    //         let taskArr: any[] = []
    //         modules.forEach((module: RestconfModuleInfo) => {
    //           taskArr.push(this.getModuleRestApi(module.name, module.revision))
    //         })
    //         Promise.all(taskArr).then(res => {

    //         })
    //         .catch(e => {

    //         })
    //       }
    //       return
    //     })
    // }

    request (url: string, { method = 'post', data = {} }: { method: Method, data: any }): Promise<any> {
      if (!url) {
        return Promise.reject()
      }
      return axios(url, {
        method: method,
        data: data
      }).then(res => {
        return res
      })
    }
  }
}