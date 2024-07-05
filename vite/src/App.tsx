// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import { HeaderTabs } from './components/HeaderTabs/HeaderTabs';
import { DoubleNavbar } from './components/DoubleNavbar/DoubleNavbar';
import { Home } from './components/Home/Home';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import store from './components/Home/store';
import './index.css';

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider>
        <div className="flex">
          <div>
            <DoubleNavbar />
          </div>
          <div className="grow">
            <HeaderTabs />
            <div>
              <Home />
            </div>
          </div>
        </div>
      </MantineProvider>
    </Provider>
  );
}
