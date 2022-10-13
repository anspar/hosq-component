import { CallOverrides } from "ethers";
import { useContractRead, useContractWrite } from "wagmi"
import hosq_abis from "./abis/hosq_abis.json";

const useHosqWrite = (chainId: number, functionName: string, args: any[], overrides?: CallOverrides) => {
    const nets: Record<string, string> = hosq_abis.hosq.networks
    return useContractWrite({
        addressOrName: nets[`${chainId}`],
        contractInterface: hosq_abis.hosq.abi,
        functionName,
        args,
        chainId,
        overrides
    })
}

const useHosqRead = (chainId: number, functionName: string, args: any[]) => {
    const nets: Record<string, string> = hosq_abis.hosq.networks
    return useContractRead({
        addressOrName: nets[`${chainId}`],
        contractInterface: hosq_abis.hosq.abi,
        functionName,
        args,
        chainId
    })
}

export { useHosqRead, useHosqWrite }