import type {
	AccountData,
	ConfigConnected,
	Connector
} from '@fractl-ui/types'
import { actions } from '../createFractl.svelte.js'

type GetAccountProps = {
  address: string
  namespace: string
}
export const getAccount = (props: GetAccountProps) => {
  const account = actions.get(props.namespace)?.getAccount()
  console.log(account)
  return account
}

export const disconnect = async ({namespace, connector}: {namespace: string, connector: Connector}) => {
  //from fractl: get namespace and call disconnect
 return await actions.get(namespace)?.disconnect(connector)
}
