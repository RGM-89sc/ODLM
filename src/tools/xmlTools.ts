type RestconfType = 'operations' | 'config'
type RestApi = { apiName: string, types: RestconfType[], methods: string[] }

export default {
  getApis: (xmlString: string) => {
    const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml')
    let apis: RestApi[] = []
    Array.from(xmlDoc.getElementsByTagName('rpc')).forEach(element => {
      const apiName = element.getAttribute('name')
      if (apiName) {
        apis.push({
          apiName: apiName, 
          types: [ 'operations' ], 
          methods: [ 'GET', 'POST'] 
        })
      }
    })

    Array.from(xmlDoc.getElementsByTagName('container')).forEach(element => {
      const apiName = element.getAttribute('name')
      const configElement = Array.from(element.getElementsByTagName('config'))
      const canConfig = configElement && configElement[0] ? configElement[0].getAttribute('value') === 'true' : false
      if (apiName) {
        apis.push({
          apiName: apiName, 
          types: canConfig ? [ 'operations', 'config' ] : [ 'operations' ], 
          methods: ['GET', 'POST'] 
        })
      }
    })
    return apis
  }
}