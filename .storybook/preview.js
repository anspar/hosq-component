import "@anspar/anspar-theme/styles.css";
import '@rainbow-me/rainbowkit/styles.css'; 
import 'react-toastify/dist/ReactToastify.css'; 


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}