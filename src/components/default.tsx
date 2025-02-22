import Footer from "./footer";
import ParticleBackground from "./particles/background";

export default function defaultPage(component: JSX.Element) {
  // Component must be wrapped in a single div that will be removed.
  const children = component.props.children;
  return (
    <div id="background" className="z-0 bg-pure-white">
      <div id="content" className="grid min-h-svh overflow-y-auto">
        <div className="grid min-h-svh grid-cols-1 place-content-center gap-12 p-1">
          {children}
        </div>
        <Footer />
      </div>
      <ParticleBackground />
    </div>
  );
}

export function defaultPageWithScroll(
  component: JSX.Element,
  below: JSX.Element,
) {
  // Component must be wrapped in a single div that will be removed.
  return (
    <div id="background" className="z-0 bg-pure-white">
      <div
        id="content"
        className="grid min-h-svh overflow-y-auto overflow-x-hidden"
      >
        <div className="grid min-h-svh grid-cols-1 place-content-center gap-12 p-1">
          {component}
        </div>
        {below}
        <Footer />
      </div>
      <ParticleBackground />
    </div>
  );
}

export function defaultPageNoSplash(component: JSX.Element) {
  // Component must be wrapped in a single div that will be removed.
  return (
    <div id="background" className="z-0 bg-pure-white">
      <div
        id="content"
        className="grid min-h-svh overflow-y-auto overflow-x-hidden"
      >
        <div className="min-h-svh">
          <div className="grid h-fit grid-cols-1 gap-12 p-1">{component}</div>
        </div>
        <Footer />
      </div>
      <ParticleBackground />
    </div>
  );
}
