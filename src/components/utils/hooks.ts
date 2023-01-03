/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import hosq_abis from './abis/hosq_abis.json'

const useHosqWrite = (chainId: number, functionName: string, args: any[], overrides?: { value: any }) => {
  const nets: Record<string, string> = hosq_abis.hosq.networks
  const { config } = usePrepareContractWrite({
    address: nets[`${chainId}`],
    abi: hosq_abis.hosq.abi,
    functionName,
    args,
    chainId,
    overrides
  })
  return useContractWrite(config)
}

const useHosqRead = (chainId: number, functionName: string, args: any[]) => {
  const nets: Record<string, string> = hosq_abis.hosq.networks
  return useContractRead({
    address: nets[`${chainId}`],
    abi: hosq_abis.hosq.abi,
    functionName,
    args,
    chainId
  })
}

export { useHosqRead, useHosqWrite }
