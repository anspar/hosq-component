import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import { HosqPicker } from './Hosq'

import { ThemeSwitch } from '@anspar/anspar-theme'

import { WalletContext, Wallet } from '@anspar/rainbowkit-anspar'

export default {
  title: 'Hosq/HosqPicker',
  component: HosqPicker
} as ComponentMeta<typeof HosqPicker>

const Template: ComponentStory<typeof HosqPicker> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: '30px' }} />
      <WalletContext testnets customTestChains={[{
        id: 1337,
        name: 'Anspar',
        network: 'Anspar',
        nativeCurrency: {
          decimals: 18,
          name: 'Anspar',
          symbol: 'AT'
        },
        rpcUrls: {
          default: { http: ['http://server:8545'] }
        }
      }]
      }>
        <Wallet />
        <br />
        <HosqPicker {...args} />
      </WalletContext>
    </>
  )
}
export const HosqProviderPicker = Template.bind({})
