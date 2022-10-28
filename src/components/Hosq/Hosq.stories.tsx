import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { HosqUploadFiles, HosqProvider } from './Hosq';

import { ThemeSwitch } from '@anspar/anspar-theme';

import { WalletContext, Wallet } from '@anspar/rainbowkit-anspar';

export default {
  title: 'WalletContext/Hosq',
  component: HosqUploadFiles,
} as ComponentMeta<typeof HosqUploadFiles>;

const Template: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: "30px" }} />
      <WalletContext testnets>
        <Wallet />
        <div style={{ marginTop: "0.5rem", backgroundColor: "var(--as-light)", padding: "1rem" }}>
          <HosqProvider>
            <HosqUploadFiles {...args} />
          </HosqProvider>
        </div>
      </WalletContext>
    </>
  )
}


export const UploadFiles = Template.bind({});
export const UploadFilesAcceptOnlyImages = Template.bind({});
UploadFilesAcceptOnlyImages.args = {
  accept: {
    "image/*": []
  }
}


const Template2: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: "30px" }} />
      <WalletContext testnets customTestChains={[{
        id: 1337,
        name: 'Anspar',
        network: 'Anspar',
        nativeCurrency: {
          decimals: 18,
          name: 'Anspar',
          symbol: 'AT',
        },
        rpcUrls: {
          default: 'https://net.anspar.io'
        }
      }]
      }>
        <Wallet />
        <div style={{ marginTop: "0.5rem", backgroundColor: "var(--as-light)", padding: "1rem" }}>
          <HosqProvider>
            <HosqUploadFiles {...args} />
          </HosqProvider>
        </div>
      </WalletContext>
    </>
  )
}
export const UploadFilesCustomChain = Template2.bind({});
UploadFilesCustomChain.args = {

}