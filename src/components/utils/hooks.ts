/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { CallOverrides } from 'ethers'
import { useContractRead, useContractWrite } from 'wagmi'
import hosq_abis from './abis/hosq_abis.json'

const useHosqWrite = (chainId: number, functionName: string, args: any[], overrides?: { from?: string, value: string }) => {
  const nets: Record<string, string> = hosq_abis.hosq.networks
  return useContractWrite({
    mode: 'recklesslyUnprepared',
    address: nets[`${chainId}`],
    abi: hosq_abis.hosq.abi,
    functionName,
    args,
    chainId,
    overrides
  })
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
