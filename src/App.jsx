import { Routes, Route } from "react-router-dom";

import { publicRoutes } from "~/routes";
import { DefaultLayout } from "~/components/layouts";

function App() {
  return (
    <Routes>
      {publicRoutes.map((route, index) => {
        const Layout = route.layout || DefaultLayout;
        const Page = route.element;
        return (
          <Route
            key={index}
            path={route.path}
            element={
              <Layout>
                <Page />
              </Layout>
            }
          />
        );
      })}
    </Routes>
  );
}

export default App;
