import ParticleBackground from "./particles/background";

export default function defaultPage(component: JSX.Element) {
  // Component must be wrapped in a single div that will be removed.
  const children = component.props.children;
  return (
    <div id="background" className="z-0 bg-pure-white">
      <div
        id="content"
        className="grid min-h-svh grid-cols-1 place-content-center gap-12 overflow-y-auto p-1"
      >
        {children}
      </div>
      <ParticleBackground />
    </div>
  );
}
