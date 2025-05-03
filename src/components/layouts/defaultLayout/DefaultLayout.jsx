import { Header } from "../elements";

function DefaultLayout({ children }) {
  return (
    <div>
      <Header />
      <div className="h-screen">{children}</div>
    </div>
  );
}

export default DefaultLayout;
