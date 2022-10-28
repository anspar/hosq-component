import "@anspar/anspar-theme/styles.css";
import '@rainbow-me/rainbowkit/styles.css'; 


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}