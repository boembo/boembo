// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import {HeaderTabs} from './components/HeaderTabs/HeaderTabs';
import {DoubleNavbar} from './components/DoubleNavbar/DoubleNavbar';
import {Home} from './components/Home/Home';
import { MantineProvider } from '@mantine/core';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import './index.css';

export default function App() {
   const [opened, { toggle }] = useDisclosure();

  return <MantineProvider>
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

</MantineProvider>;
}